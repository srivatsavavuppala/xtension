from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Tuple
from urllib.parse import urlparse
import os
import time
import hashlib
import requests
import numpy as np

try:
    from pinecone import Pinecone, ServerlessSpec
except Exception:
    Pinecone = None
    ServerlessSpec = None

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Get API keys from environment
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.environ.get("PINECONE_ENVIRONMENT", "us-east-1")

PINECONE_FILES_INDEX = os.environ.get("PINECONE_FILES_INDEX", "xtension-files")
PINECONE_CHUNKS_INDEX = os.environ.get("PINECONE_CHUNKS_INDEX", "xtension-chunks")
try:
    PINECONE_MAX_INDEXES = int(os.environ.get("PINECONE_MAX_INDEXES", "5"))
except ValueError:
    PINECONE_MAX_INDEXES = 5
MAX_INDEX_NAME_LENGTH = 45

def _normalize_origin_and_host(value: Optional[str]) -> Optional[Tuple[str, str]]:
    if not value:
        return None
    raw = value.strip()
    if not raw:
        return None
    raw = raw.rstrip("/")
    if "://" not in raw:
        raw = f"https://{raw}"
    parsed = urlparse(raw)
    host = parsed.netloc or parsed.path
    if not host:
        return None
    scheme = parsed.scheme or "https"
    host = host.lower()
    normalized_origin = f"{scheme}://{host}"
    return normalized_origin, host


def _parse_allowed_origin_map(raw_value: Optional[str]) -> Dict[str, str]:
    origin_map: Dict[str, str] = {}
    if not raw_value:
        return origin_map
    for part in raw_value.split(","):
        if not part.strip():
            continue
        normalized = _normalize_origin_and_host(part)
        if not normalized:
            continue
        origin, host = normalized
        origin_map[host] = origin
    return origin_map


def _extract_host_from_header(value: Optional[str]) -> Optional[str]:
    normalized = _normalize_origin_and_host(value)
    if not normalized:
        return None
    _, host = normalized
    return host


_allowed_origin_env_values: List[str] = []
_env_allowed_origins = os.environ.get("ALLOWED_ORIGINS")
if _env_allowed_origins:
    _allowed_origin_env_values.append(_env_allowed_origins)
_env_vercel_domain = os.environ.get("VERCEL_ALLOWED_DOMAIN")
if _env_vercel_domain:
    _allowed_origin_env_values.append(_env_vercel_domain)

ALLOWED_ORIGIN_MAP = _parse_allowed_origin_map(",".join(_allowed_origin_env_values))


def _resolve_request_origin(request: Request) -> Optional[str]:
    if not ALLOWED_ORIGIN_MAP:
        return "*"
    header_candidates = [
        request.headers.get("origin"),
        request.headers.get("referer"),
        request.headers.get("x-vercel-deployment-url"),
    ]
    for candidate in header_candidates:
        host = _extract_host_from_header(candidate)
        if host and host in ALLOWED_ORIGIN_MAP:
            return ALLOWED_ORIGIN_MAP[host]
    return None


def _build_cors_headers(origin: Optional[str]) -> Dict[str, str]:
    origin_value = origin or "*"
    headers = {
        "Access-Control-Allow-Origin": origin_value,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "false",
        "Access-Control-Max-Age": "86400",
    }
    if origin_value != "*":
        headers["Vary"] = "Origin"
    return headers

if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY not found in environment variables")
if not PINECONE_API_KEY:
    print("Warning: PINECONE_API_KEY not found in environment variables")

app = FastAPI()

# Custom CORS middleware as backup to ensure headers are always added
class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        allowed_origin = _resolve_request_origin(request)
        if allowed_origin is None:
            return Response(
                content="Origin not allowed. This API is restricted to approved domains.",
                status_code=403
            )

        if request.method == "OPTIONS":
            return Response(
                content="",
                status_code=200,
                headers=_build_cors_headers(allowed_origin)
            )
        
        response = await call_next(request)
        
        cors_headers = _build_cors_headers(allowed_origin)
        for key, value in cors_headers.items():
            response.headers[key] = value
        return response

# Add both middleware layers for maximum compatibility
app.add_middleware(CustomCORSMiddleware)
_cors_allowed_origins = list(ALLOWED_ORIGIN_MAP.values()) if ALLOWED_ORIGIN_MAP else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allowed_origins,
    allow_credentials=False,  # Changed to False to allow wildcard origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "GitHub Repo Summarizer RAG API is running", "cors_enabled": True}

@app.options("/{full_path:path}")
async def options_handler(full_path: str, request: Request):
    """Explicit OPTIONS handler for CORS preflight"""
    allowed_origin = _resolve_request_origin(request)
    if allowed_origin is None:
        return Response(
            content="",
            status_code=403,
        )
    return Response(
        content="",
        status_code=200,
        headers=_build_cors_headers(allowed_origin)
    )

class RepoInfo(BaseModel):
    repo: str
    owner: str
    description: str

# Configuration
EMBEDDING_MODEL_NAME = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
EMBEDDING_DIMENSION = 384  # Dimension for all-MiniLM-L6-v2
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

_embedding_model: Optional[SentenceTransformer] = None
_pinecone_client = None


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        if SentenceTransformer is None:
            raise HTTPException(status_code=500, detail="sentence-transformers not installed")
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _embedding_model


def get_pinecone_client():
    global _pinecone_client
    if _pinecone_client is None:
        if Pinecone is None:
            raise HTTPException(status_code=500, detail="pinecone-client not installed")
        if not PINECONE_API_KEY:
            raise HTTPException(status_code=500, detail="PINECONE_API_KEY not configured")
        _pinecone_client = Pinecone(api_key=PINECONE_API_KEY)
    return _pinecone_client


def _sanitize_index_name(index_name: str) -> str:
    name = index_name.lower().replace('/', '-').replace('_', '-').replace('@', '-')
    name = ''.join(c for c in name if c.isalnum() or c == '-')
    if not name:
        name = "default-index"
    if len(name) > MAX_INDEX_NAME_LENGTH:
        name = name[:MAX_INDEX_NAME_LENGTH].rstrip('-')
        if not name:
            name = "default-index"
    return name


def _normalise_index_listing(indexes) -> set:
    names = set()
    for item in indexes:
        if isinstance(item, dict):
            name = item.get('name')
        else:
            name = getattr(item, 'name', None) or str(item)
        if name:
            names.add(name)
    return names


def get_or_create_index(index_name: str):
    """Get or create a Pinecone index.

    Returns a tuple of (Index instance, resolved index name, uses_namespace flag).
    """
    pc = get_pinecone_client()
    requested_name = _sanitize_index_name(index_name)

    try:
        existing_indexes = pc.list_indexes()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to list Pinecone indexes: {exc}")

    index_names = _normalise_index_listing(existing_indexes)

    if requested_name in index_names:
        return pc.Index(requested_name), requested_name, False

    shared_mapping = {
        'files': _sanitize_index_name(PINECONE_FILES_INDEX),
        'chunks': _sanitize_index_name(PINECONE_CHUNKS_INDEX),
    }

    index_type = None
    if requested_name.startswith('files-'):
        index_type = 'files'
    elif requested_name.startswith('chunks-'):
        index_type = 'chunks'

    target_name = requested_name
    requires_namespace = False

    if index_type and index_type in shared_mapping:
        # Prefer shared index for this type unless a repo-specific one already exists
        shared_name = shared_mapping[index_type]
        if shared_name in index_names:
            return pc.Index(shared_name), shared_name, True
        target_name = shared_name
        requires_namespace = True

    if target_name in index_names:
        return pc.Index(target_name), target_name, requires_namespace

    if len(index_names) >= PINECONE_MAX_INDEXES and target_name not in index_names:
        detail = (
            "Reached Pinecone serverless index limit. Delete unused indexes in your Pinecone "
            "project or set PINECONE_FILES_INDEX/PINECONE_CHUNKS_INDEX to reuse an existing "
            "index."
        )
        raise HTTPException(status_code=507, detail=detail)

    try:
        pc.create_index(
            name=target_name,
            dimension=EMBEDDING_DIMENSION,
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region=PINECONE_ENVIRONMENT
            )
        )
        time.sleep(1)
    except Exception as exc:
        error_text = str(exc).lower()
        if "max serverless indexes" in error_text or "forbidden" in error_text:
            detail = (
                "Pinecone denied index creation due to project limits. Reduce existing indexes "
                "or point PINECONE_FILES_INDEX/PINECONE_CHUNKS_INDEX to an existing index "
                "name."
            )
            raise HTTPException(status_code=507, detail=detail) from exc
        raise HTTPException(status_code=502, detail=f"Failed to create Pinecone index '{target_name}': {exc}") from exc

    return pc.Index(target_name), target_name, requires_namespace


def get_repo_id(owner: str, repo: str, branch: Optional[str]) -> str:
    branch_part = f"@{branch}" if branch else ""
    return f"{owner}/{repo}{branch_part}"


def get_default_branch(owner: str, repo: str) -> str:
    try:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"
        r = requests.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers, timeout=15)
        if r.ok:
            return r.json().get("default_branch", "main")
    except Exception:
        pass
    return "main"


def list_repo_files(owner: str, repo: str, branch: str) -> List[str]:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
    r = requests.get(url, headers=headers, timeout=20)
    if not r.ok:
        branch_fallback = "master" if branch != "master" else branch
        r = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch_fallback}?recursive=1",
            headers=headers,
            timeout=20,
        )
        if not r.ok:
            raise HTTPException(status_code=502, detail=f"Failed to fetch repo tree: {r.status_code}")
        branch = branch_fallback
    data = r.json()
    files = []
    for item in data.get("tree", []):
        if item.get("type") == "blob":
            path = item["path"]
            if is_supported_text_file(path):
                files.append(path)
    return files


def is_supported_text_file(path: str) -> bool:
    binary_exts = {
        ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
        ".pdf", ".zip", ".gz", ".tar", ".rar", ".7z",
        ".mp4", ".mp3", ".wav", ".woff", ".woff2", ".ttf",
        ".jar", ".bin"
    }
    _, ext = os.path.splitext(path.lower())
    if ext in binary_exts:
        return False
    allow_exts = {
        ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".rb", ".rs",
        ".cpp", ".cc", ".c", ".h", ".hpp", ".cs", ".php", ".swift",
        ".kt", ".kts", ".scala", ".r", ".m", ".mm", ".sh", ".bash", ".zsh",
        ".html", ".css", ".scss", ".less", ".json", ".yml", ".yaml", ".toml",
        ".md", ".txt", ".env", ".ini", ".cfg", ".conf", ".sql"
    }
    if os.path.basename(path).lower() in {"license", "readme", "readme.md", ".gitignore", ".dockerignore"}:
        return True
    return ext in allow_exts


def fetch_file_content(owner: str, repo: str, branch: str, path: str) -> Optional[str]:
    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
    try:
        r = requests.get(raw_url, timeout=20)
        if r.ok:
            if len(r.content) > 500 * 1024:
                return None
            text = r.text
            if "\x00" in text:
                return None
            return text
    except Exception:
        return None
    return None


def chunk_code(content: str, min_chars: int = 900, max_chars: int = 1800, overlap_lines: int = 15) -> List[Tuple[str, int, int]]:
    lines = content.splitlines()
    chunks: List[Tuple[str, int, int]] = []
    start = 0
    n = len(lines)
    while start < n:
        current_chars = 0
        end = start
        while end < n and current_chars < max_chars:
            current_chars += len(lines[end]) + 1
            if current_chars >= min_chars and (end - start) >= 20:
                pass
            end += 1
        if end <= start:
            end = start + 1
        chunk_text = "\n".join(lines[start:end])
        chunks.append((chunk_text, start + 1, end))
        start = end - overlap_lines
        if start < 0:
            start = 0
        if start >= n:
            break
        if end >= n:
            break
    return chunks


def sha1_id(repo_id: str, path: str, start_line: Optional[int] = None, end_line: Optional[int] = None) -> str:
    base = f"{repo_id}:{path}:{start_line or ''}:{end_line or ''}"
    return hashlib.sha1(base.encode("utf-8")).hexdigest()


class BuildEmbeddingsRequest(BaseModel):
    owner: str
    repo: str
    branch: Optional[str] = None


class BuildEmbeddingsResponse(BaseModel):
    repo_id: str
    branch: str
    num_files_indexed: int
    num_chunks_indexed: int
    took_seconds: float


def check_if_indexed(owner: str, repo: str, branch: Optional[str] = None) -> bool:
    """Check if repository has already been indexed"""
    try:
        branch = branch or get_default_branch(owner, repo)
        repo_id = get_repo_id(owner, repo, branch)
        index, _, use_namespace = get_or_create_index(f"files-{repo_id}")

        query_kwargs = {
            'vector': [0.0] * EMBEDDING_DIMENSION,
            'top_k': 1,
            'include_metadata': True,
            'filter': {'repo_id': {'$eq': repo_id}},
        }

        if use_namespace:
            query_kwargs['namespace'] = repo_id

        # Query to check if any vectors exist
        results = index.query(**query_kwargs)
        return len(results.get('matches', [])) > 0
    except Exception:
        return False


@app.post("/build_embeddings", response_model=BuildEmbeddingsResponse)
def build_embeddings(req: BuildEmbeddingsRequest):
    start_time = time.time()
    branch = req.branch or get_default_branch(req.owner, req.repo)
    repo_id = get_repo_id(req.owner, req.repo, branch)
    
    # Create separate indexes for files and chunks
    files_index, _, files_use_namespace = get_or_create_index(f"files-{repo_id}")
    chunks_index, _, chunks_use_namespace = get_or_create_index(f"chunks-{repo_id}")

    files_namespace = repo_id if files_use_namespace else None
    chunks_namespace = repo_id if chunks_use_namespace else None
    
    model = get_embedding_model()
    files = list_repo_files(req.owner, req.repo, branch)
    num_files = 0
    num_chunks = 0
    
    # Process files
    file_vectors = []
    for path in files:
        content = fetch_file_content(req.owner, req.repo, branch, path)
        if not content:
            continue
        
        file_text = content[:10000]
        file_id = sha1_id(repo_id, path)
        file_emb = model.encode([file_text], convert_to_numpy=True)[0]
        
        file_vectors.append({
            'id': file_id,
            'values': file_emb.tolist(),
            'metadata': {
                'repo_id': repo_id,
                'owner': req.owner,
                'repo': req.repo,
                'branch': branch,
                'file_path': path,
                'type': 'file'
            }
        })
        num_files += 1
    
    # Upsert files in batches
    if file_vectors:
        batch_size = 100
        for i in range(0, len(file_vectors), batch_size):
            batch = file_vectors[i:i + batch_size]
            upsert_kwargs = {'vectors': batch}
            if files_namespace:
                upsert_kwargs['namespace'] = files_namespace
            files_index.upsert(**upsert_kwargs)
    
    # Process chunks
    chunk_vectors = []
    for path in files:
        content = fetch_file_content(req.owner, req.repo, branch, path)
        if not content:
            continue
        
        chunks = chunk_code(content)
        for chunk_text, start_line, end_line in chunks:
            chunk_id = sha1_id(repo_id, path, start_line, end_line)
            chunk_emb = model.encode([chunk_text], convert_to_numpy=True)[0]
            
            chunk_vectors.append({
                'id': chunk_id,
                'values': chunk_emb.tolist(),
                'metadata': {
                    'repo_id': repo_id,
                    'owner': req.owner,
                    'repo': req.repo,
                    'branch': branch,
                    'file_path': path,
                    'start_line': start_line,
                    'end_line': end_line,
                    'text': chunk_text[:1000],  # Store truncated text for retrieval
                    'type': 'chunk'
                }
            })
            num_chunks += 1
            
            # Batch upsert every 200 chunks
            if len(chunk_vectors) >= 200:
                upsert_kwargs = {'vectors': chunk_vectors}
                if chunks_namespace:
                    upsert_kwargs['namespace'] = chunks_namespace
                chunks_index.upsert(**upsert_kwargs)
                chunk_vectors = []
    
    # Upsert remaining chunks
    if chunk_vectors:
        upsert_kwargs = {'vectors': chunk_vectors}
        if chunks_namespace:
            upsert_kwargs['namespace'] = chunks_namespace
        chunks_index.upsert(**upsert_kwargs)
    
    took = time.time() - start_time
    return BuildEmbeddingsResponse(
        repo_id=repo_id,
        branch=branch,
        num_files_indexed=num_files,
        num_chunks_indexed=num_chunks,
        took_seconds=round(took, 2),
    )


class QueryRequest(BaseModel):
    owner: str
    repo: str
    question: str
    branch: Optional[str] = None
    top_files: int = 8
    top_chunks: int = 12


class Reference(BaseModel):
    file_path: str
    start_line: int
    end_line: int
    url: str


class QueryResponse(BaseModel):
    answer: str
    references: List[Reference]


def _query_pinecone_files(repo_id: str, query_emb: np.ndarray, top_files: int):
    index, _, use_namespace = get_or_create_index(f"files-{repo_id}")
    query_kwargs = {
        'vector': query_emb.tolist(),
        'top_k': top_files,
        'include_metadata': True,
        'filter': {'repo_id': {'$eq': repo_id}},
    }
    if use_namespace:
        query_kwargs['namespace'] = repo_id
    results = index.query(**query_kwargs)
    return results


def _query_pinecone_chunks(repo_id: str, query_emb: np.ndarray, file_paths: List[str], per_file: int) -> List[Dict[str, Any]]:
    index, _, use_namespace = get_or_create_index(f"chunks-{repo_id}")
    results_list: List[Dict[str, Any]] = []
    
    for path in file_paths:
        query_kwargs = {
            'vector': query_emb.tolist(),
            'top_k': per_file,
            'include_metadata': True,
            'filter': {
                'repo_id': {'$eq': repo_id},
                'file_path': {'$eq': path}
            }
        }
        if use_namespace:
            query_kwargs['namespace'] = repo_id
        results = index.query(**query_kwargs)
        
        for match in results.get('matches', []):
            results_list.append({
                'id': match['id'],
                'doc': match['metadata'].get('text', ''),
                'meta': match['metadata'],
                'dist': 1 - match['score']  # Convert similarity to distance
            })
    
    results_list.sort(key=lambda x: x.get('dist', 0.0))
    return results_list


def _build_citation_url(owner: str, repo: str, branch: str, path: str, start_line: int, end_line: int) -> str:
    return f"https://github.com/{owner}/{repo}/blob/{branch}/{path}#L{start_line}-L{end_line}"


def _format_context(chunks: List[Dict[str, Any]]) -> str:
    context_parts = []
    for idx, item in enumerate(chunks, 1):
        meta = item["meta"]
        header = f"[{idx}] {meta['file_path']}:{meta['start_line']}-{meta['end_line']}"
        context_parts.append(f"{header}\n{item['doc']}")
    return "\n\n".join(context_parts)


def _call_llm(question: str, context: str) -> str:
    try:
        from groq import Groq
        api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("API_KEY")
        if not api_key:
            return (
                "No LLM API key configured. Based on retrieved context, here are relevant snippets:\n\n"
                + context
            )
        client = Groq(api_key=api_key)
        system = (
            "You are a precise code assistant. Answer using the provided context only. "
            "Include concise explanations and avoid speculation."
        )
        prompt = (
            "Answer the user's question about the repository. Cite sources inline using [n] that map to the context blocks.\n\n"
            "Context blocks (with [n] headers):\n\n"
            f"{context}\n\n"
            "Question: " + question + "\n\n"
            "Answer:"
        )
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            stream=False,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return (
            "LLM call failed. Returning relevant context instead.\n\n"
            + context
            + f"\n\n[error: {e}]"
        )


@app.post("/query", response_model=QueryResponse)
def query_repo(req: QueryRequest):
    branch = req.branch or get_default_branch(req.owner, req.repo)
    repo_id = get_repo_id(req.owner, req.repo, branch)
    
    model = get_embedding_model()
    query_emb = model.encode([req.question], convert_to_numpy=True, show_progress_bar=False)[0]
    
    # Stage 1: retrieve relevant files
    file_res = _query_pinecone_files(repo_id, query_emb, req.top_files)
    file_paths: List[str] = []
    if file_res and file_res.get('matches'):
        for match in file_res['matches']:
            if match.get('metadata') and match['metadata'].get('file_path'):
                file_paths.append(match['metadata']['file_path'])
    
    # Stage 2: retrieve relevant chunks within those files
    per_file = max(1, req.top_chunks // max(1, len(file_paths) or 1))
    chunk_hits = _query_pinecone_chunks(repo_id, query_emb, file_paths, per_file)
    top_chunks = chunk_hits[:req.top_chunks]
    
    if not top_chunks:
        return QueryResponse(answer="No relevant code found for your question.", references=[])
    
    context_text = _format_context(top_chunks)
    answer_text = _call_llm(req.question, context_text)
    
    # Build references
    refs: List[Reference] = []
    used = set()
    for item in top_chunks:
        m = item["meta"]
        key = (m["file_path"], m["start_line"], m["end_line"])
        if key in used:
            continue
        used.add(key)
        refs.append(
            Reference(
                file_path=m["file_path"],
                start_line=int(m["start_line"]),
                end_line=int(m["end_line"]),
                url=_build_citation_url(m["owner"], m["repo"], m["branch"], m["file_path"], int(m["start_line"]), int(m["end_line"]))
            )
        )
    
    return QueryResponse(answer=answer_text, references=refs)


def _query_for_summary(owner: str, repo: str, branch: str, question: str, top_chunks: int = 20) -> str:
    """Internal function to query RAG system for summary generation"""
    repo_id = get_repo_id(owner, repo, branch)
    
    try:
        model = get_embedding_model()
        query_emb = model.encode([question], convert_to_numpy=True, show_progress_bar=False)[0]
        
        file_res = _query_pinecone_files(repo_id, query_emb, top_files=10)
        file_paths: List[str] = []
        if file_res and file_res.get('matches'):
            for match in file_res['matches']:
                if match.get('metadata') and match['metadata'].get('file_path'):
                    file_paths.append(match['metadata']['file_path'])
        
        per_file = max(1, top_chunks // max(1, len(file_paths) or 1))
        chunk_hits = _query_pinecone_chunks(repo_id, query_emb, file_paths, per_file)
        top_chunks_data = chunk_hits[:top_chunks]
        
        if top_chunks_data:
            return _format_context(top_chunks_data)
        else:
            return "No relevant code context found."
    except Exception as e:
        return f"Error retrieving context: {str(e)}"


@app.post("/summarize")
def summarize_repo(info: RepoInfo):
    """Enhanced summarization using RAG system to analyze actual code"""
    branch = get_default_branch(info.owner, info.repo)
    is_indexed = check_if_indexed(info.owner, info.repo, branch)
    
    if not is_indexed:
        try:
            build_req = BuildEmbeddingsRequest(
                owner=info.owner,
                repo=info.repo,
                branch=branch
            )
            build_result = build_embeddings(build_req)
            print(f"Indexed {build_result.num_files_indexed} files in {build_result.took_seconds}s")
        except Exception as e:
            print(f"Warning: Failed to index repository: {e}")
            return _fallback_readme_summary(info)
    
    try:
        readme = ""
        try:
            r = requests.get(
                f"https://api.github.com/repos/{info.owner}/{info.repo}/readme",
                headers={"Accept": "application/vnd.github.v3.raw"},
                timeout=15
            )
            if r.ok:
                readme = r.text[:2000]
        except Exception:
            pass
        
        architecture_context = _query_for_summary(
            info.owner, info.repo, branch,
            "What is the main architecture, frameworks, and key technical components of this project?",
            top_chunks=15
        )
        
        structure_context = _query_for_summary(
            info.owner, info.repo, branch,
            "What are the main entry points, file structure, and how is the project organized?",
            top_chunks=10
        )
        
        from groq import Groq
        api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("API_KEY")
        if not api_key:
            return {"summary": "API key not configured", "project_paper": ""}
        
        client = Groq(api_key=api_key)
        
        summary_prompt = f"""Based on the actual code analysis of the GitHub repository {info.owner}/{info.repo}, create a concise 2-3 paragraph summary.

Repository Description: {info.description}

README Excerpt:
{readme}

Code Analysis - Architecture & Components:
{architecture_context[:3000]}

Code Analysis - Project Structure:
{structure_context[:2000]}

Instructions:
- Focus on what the project actually does based on the code
- Mention the main technologies/frameworks found in the code
- Describe the architecture and how components are organized
- Be specific and technical, avoiding generic statements
- Keep it concise (2-3 paragraphs max)
"""
        
        summary_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": summary_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            stream=False,
        )
        summary = summary_completion.choices[0].message.content
        
        paper_prompt = f"""Based on the actual code analysis of {info.owner}/{info.repo}, create a comprehensive one-page project overview.

Repository Description: {info.description}

README Content:
{readme}

Code Analysis - Architecture & Technologies:
{architecture_context[:4000]}

Code Analysis - Project Structure:
{structure_context[:2500]}

Create a detailed overview with these sections:
1. **Project Name and Purpose**: What problem does it solve?
2. **Technical Architecture**: Based on actual code structure
3. **Key Technologies & Frameworks**: Found in the codebase
4. **Main Features**: Derived from code analysis
5. **File/Folder Structure**: Major components and their roles
6. **How to Use/Run**: Based on configuration files and entry points
7. **Development Setup**: Dependencies and requirements found in code
8. **Contribution Guidelines**: If mentioned in README or docs

Be specific and technical. Reference actual files and components found in the code.
"""
        
        paper_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": paper_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            stream=False,
        )
        project_paper = paper_completion.choices[0].message.content
        
        return {
            "summary": summary,
            "project_paper": project_paper,
            "indexed": True,
            "branch": branch
        }
        
    except Exception as e:
        print(f"Error in RAG-based summarization: {e}")
        return _fallback_readme_summary(info)


def _fallback_readme_summary(info: RepoInfo):
    """Fallback to README-only summary if RAG fails"""
    readme = ""
    try:
        r = requests.get(
            f"https://api.github.com/repos/{info.owner}/{info.repo}/readme",
            headers={"Accept": "application/vnd.github.v3.raw"},
            timeout=15
        )
        if r.ok:
            readme = r.text
    except Exception:
        pass
    
    from groq import Groq
    api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("API_KEY")
    if not api_key:
        return {"summary": "API key not configured", "project_paper": ""}
    
    client = Groq(api_key=api_key)
    
    summary_prompt = f"""Summarize this GitHub repository concisely:
Repository: {info.owner}/{info.repo}
Description: {info.description}
README: {readme[:2000]}
"""
    
    summary = client.chat.completions.create(
        messages=[{"role": "user", "content": summary_prompt}],
        model="llama-3.3-70b-versatile",
        stream=False,
    ).choices[0].message.content
    
    paper_prompt = f"""Create a project overview for:
Repository: {info.owner}/{info.repo}
Description: {info.description}
README: {readme[:4000]}
"""
    
    project_paper = client.chat.completions.create(
        messages=[{"role": "user", "content": paper_prompt}],
        model="llama-3.3-70b-versatile",
        stream=False,
    ).choices[0].message.content
    
    return {
        "summary": summary,
        "project_paper": project_paper,
        "indexed": False
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))