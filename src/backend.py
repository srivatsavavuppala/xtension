from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Tuple
import os
import time
import hashlib
import uuid
import requests as http_requests
import traceback

from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
JINA_API_KEY = os.environ.get("JINA_API_KEY")
QDRANT_URL = os.environ.get("QDRANT_URL")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

EMBEDDING_MODEL = "jina-embeddings-v2-base-code"
EMBEDDING_DIM = 768
FILES_COLLECTION = "xtension_files"
CHUNKS_COLLECTION = "xtension_chunks"

for var, name in [(GROQ_API_KEY, "GROQ_API_KEY"), (JINA_API_KEY, "JINA_API_KEY"),
                  (QDRANT_URL, "QDRANT_URL"), (QDRANT_API_KEY, "QDRANT_API_KEY")]:
    if not var:
        print(f"Warning: {name} not set")

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance, VectorParams, PointStruct,
        Filter, FieldCondition, MatchValue, PayloadSchemaType
    )
except ImportError:
    QdrantClient = None
    print("Warning: qdrant-client not installed")

# ─── App + CORS ────────────────────────────────────────────────────────────

app = FastAPI()


class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "false"
            return response
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "false"
        return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.add_middleware(CustomCORSMiddleware)


@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"message": "GitHub Repo Summarizer RAG API", "version": "2.0"}


@app.options("/{full_path:path}")
async def options_handler(full_path: str, request: Request):
    return Response(
        content="",
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        },
    )


# ─── Pydantic models ───────────────────────────────────────────────────────

class RepoInfo(BaseModel):
    repo: str
    owner: str
    description: str


class BuildEmbeddingsRequest(BaseModel):
    owner: str
    repo: str
    branch: Optional[str] = None


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


# ─── Qdrant client ─────────────────────────────────────────────────────────

_qdrant_client = None
_collections_ready = False


def get_qdrant_client():
    global _qdrant_client
    if _qdrant_client is None:
        if QdrantClient is None:
            raise HTTPException(500, "qdrant-client not installed")
        if not QDRANT_URL:
            raise HTTPException(500, "QDRANT_URL not configured")
        _qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=30)
    return _qdrant_client


def ensure_collections():
    global _collections_ready
    if _collections_ready:
        return
    client = get_qdrant_client()
    try:
        existing = {c.name for c in client.get_collections().collections}
        for coll in [FILES_COLLECTION, CHUNKS_COLLECTION]:
            if coll not in existing:
                client.create_collection(
                    collection_name=coll,
                    vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
                )
            # Always ensure indexes — idempotent, safe to call even if they exist.
            # Qdrant Cloud requires indexes on every field used in a filter.
            for field in ["repo_id", "file_path"]:
                try:
                    client.create_payload_index(
                        collection_name=coll,
                        field_name=field,
                        field_schema=PayloadSchemaType.KEYWORD,
                    )
                except Exception:
                    pass  # already exists
        _collections_ready = True
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"Qdrant setup error: {e}")


# ─── Jina AI embeddings ────────────────────────────────────────────────────

def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Batch-embed texts via Jina AI API. No local model — no cold-start delay."""
    if not texts:
        return []
    if not JINA_API_KEY:
        raise HTTPException(500, "JINA_API_KEY not configured")

    all_embeddings: List[List[float]] = []
    batch_size = 64

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        try:
            r = http_requests.post(
                "https://api.jina.ai/v1/embeddings",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {JINA_API_KEY}",
                },
                json={"input": batch, "model": EMBEDDING_MODEL},
                timeout=60,
            )
            if not r.ok:
                raise HTTPException(502, f"Jina API error {r.status_code}: {r.text[:200]}")
            data = r.json()
            all_embeddings.extend(item["embedding"] for item in data["data"])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(502, f"Jina API call failed: {e}")

    return all_embeddings


# ─── Utilities ─────────────────────────────────────────────────────────────

def make_point_id(repo_id: str, path: str, start_line=None, end_line=None) -> str:
    """Deterministic UUID from content — ensures upserts don't create duplicates."""
    base = f"{repo_id}:{path}:{start_line or ''}:{end_line or ''}"
    digest = hashlib.sha1(base.encode()).digest()[:16]
    return str(uuid.UUID(bytes=digest))


def get_repo_id(owner: str, repo: str, branch: Optional[str]) -> str:
    return f"{owner}/{repo}@{branch}" if branch else f"{owner}/{repo}"


def get_default_branch(owner: str, repo: str) -> str:
    try:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"
        r = http_requests.get(
            f"https://api.github.com/repos/{owner}/{repo}", headers=headers, timeout=15
        )
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
    r = http_requests.get(url, headers=headers, timeout=20)
    if not r.ok:
        fallback = "master" if branch != "master" else "main"
        r = http_requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/git/trees/{fallback}?recursive=1",
            headers=headers,
            timeout=20,
        )
        if not r.ok:
            raise HTTPException(502, f"Failed to fetch repo tree: {r.status_code}")
    data = r.json()
    files = [
        item["path"]
        for item in data.get("tree", [])
        if item.get("type") == "blob" and _is_supported_text_file(item["path"])
    ]
    return _prioritize_files(files)


def _prioritize_files(files: List[str], max_files: int = 50) -> List[str]:
    """Return the most important files first, capped at max_files.

    Prioritises root-level entry points and config files so small repos get
    fully indexed while large repos (langchain, etc.) stay fast.
    """
    def score(path: str) -> int:
        name = os.path.basename(path).lower()
        depth = path.count("/")
        if name in {"readme.md", "readme", "readme.txt", "readme.rst"}:
            return 0
        if name in {"package.json", "requirements.txt", "pyproject.toml",
                    "cargo.toml", "go.mod", "setup.py", "setup.cfg"}:
            return 1
        if name in {"main.py", "app.py", "index.js", "main.js",
                    "index.ts", "main.ts", "server.py", "server.js"}:
            return 2
        if depth == 0:
            return 3
        if depth == 1:
            return 4
        return 5 + depth

    return sorted(files, key=score)[:max_files]


def _is_supported_text_file(path: str) -> bool:
    binary_exts = {
        ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
        ".pdf", ".zip", ".gz", ".tar", ".rar", ".7z",
        ".mp4", ".mp3", ".wav", ".woff", ".woff2", ".ttf",
        ".jar", ".bin",
    }
    allow_exts = {
        ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".rb", ".rs",
        ".cpp", ".cc", ".c", ".h", ".hpp", ".cs", ".php", ".swift",
        ".kt", ".kts", ".scala", ".r", ".m", ".mm", ".sh", ".bash", ".zsh",
        ".html", ".css", ".scss", ".less", ".json", ".yml", ".yaml", ".toml",
        ".md", ".txt", ".env", ".ini", ".cfg", ".conf", ".sql",
    }
    _, ext = os.path.splitext(path.lower())
    if ext in binary_exts:
        return False
    if os.path.basename(path).lower() in {"license", "readme", "readme.md", ".gitignore", ".dockerignore"}:
        return True
    return ext in allow_exts


def fetch_file_content(owner: str, repo: str, branch: str, path: str) -> Optional[str]:
    try:
        r = http_requests.get(
            f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}", timeout=20
        )
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


def chunk_code(
    content: str, min_chars: int = 900, max_chars: int = 1800, overlap_lines: int = 15
) -> List[Tuple[str, int, int]]:
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
                break
            end += 1
        if end <= start:
            end = start + 1
        chunks.append(("\n".join(lines[start:end]), start + 1, end))
        start = end - overlap_lines
        if start < 0:
            start = 0
        if start >= n or end >= n:
            break
    return chunks


# ─── Index check ───────────────────────────────────────────────────────────

def check_if_indexed(owner: str, repo: str, branch: Optional[str] = None) -> bool:
    """Returns True only when BOTH files and chunks exist — partial indexes trigger re-indexing."""
    try:
        branch = branch or get_default_branch(owner, repo)
        repo_id = get_repo_id(owner, repo, branch)
        ensure_collections()
        client = get_qdrant_client()
        files, _ = client.scroll(
            collection_name=FILES_COLLECTION,
            scroll_filter=Filter(
                must=[FieldCondition(key="repo_id", match=MatchValue(value=repo_id))]
            ),
            limit=1,
        )
        if not files:
            return False
        chunks, _ = client.scroll(
            collection_name=CHUNKS_COLLECTION,
            scroll_filter=Filter(
                must=[FieldCondition(key="repo_id", match=MatchValue(value=repo_id))]
            ),
            limit=1,
        )
        return len(chunks) > 0
    except Exception:
        return False


# ─── Background indexing ───────────────────────────────────────────────────

_indexing_jobs: Dict[str, Dict] = {}


def _do_build_embeddings(owner: str, repo: str, branch: str, repo_id: str):
    """Runs in FastAPI's thread pool via BackgroundTasks."""
    try:
        _indexing_jobs[repo_id].update({"status": "indexing", "message": "Listing repository files..."})

        files = list_repo_files(owner, repo, branch)
        _indexing_jobs[repo_id]["message"] = f"Fetching {len(files)} files..."

        # Single fetch pass — contents reused for both file- and chunk-level embeddings
        file_contents: Dict[str, str] = {}
        for path in files:
            content = fetch_file_content(owner, repo, branch, path)
            if content:
                file_contents[path] = content

        if not file_contents:
            raise ValueError("No readable files found in repository")

        paths = list(file_contents.keys())
        _indexing_jobs[repo_id]["message"] = f"Embedding {len(paths)} files via Jina AI..."

        # Batch-embed all file texts in one API call
        file_texts = [content[:10000] for content in file_contents.values()]
        file_embeddings = get_embeddings(file_texts)

        ensure_collections()
        client = get_qdrant_client()

        file_points = [
            PointStruct(
                id=make_point_id(repo_id, path),
                vector=emb,
                payload={
                    "repo_id": repo_id, "owner": owner, "repo": repo,
                    "branch": branch, "file_path": path, "type": "file",
                },
            )
            for path, emb in zip(paths, file_embeddings)
        ]
        for i in range(0, len(file_points), 100):
            client.upsert(collection_name=FILES_COLLECTION, points=file_points[i : i + 100])

        # Collect all chunks across all files, then embed in one batch
        _indexing_jobs[repo_id]["message"] = "Creating code chunks..."
        all_chunks: List[Tuple[str, str, int, int]] = []  # (path, text, start, end)
        for path, content in file_contents.items():
            for chunk_text, start_line, end_line in chunk_code(content):
                all_chunks.append((path, chunk_text, start_line, end_line))

        _indexing_jobs[repo_id]["message"] = f"Embedding {len(all_chunks)} code chunks via Jina AI..."
        chunk_texts = [ct for _, ct, _, _ in all_chunks]
        chunk_embeddings = get_embeddings(chunk_texts)

        chunk_points = [
            PointStruct(
                id=make_point_id(repo_id, path, start, end),
                vector=emb,
                payload={
                    "repo_id": repo_id, "owner": owner, "repo": repo,
                    "branch": branch, "file_path": path,
                    "start_line": start, "end_line": end,
                    "text": chunk_text[:1000], "type": "chunk",
                },
            )
            for (path, chunk_text, start, end), emb in zip(all_chunks, chunk_embeddings)
        ]
        for i in range(0, len(chunk_points), 200):
            client.upsert(collection_name=CHUNKS_COLLECTION, points=chunk_points[i : i + 200])

        _indexing_jobs[repo_id].update({
            "status": "done",
            "num_files": len(file_contents),
            "num_chunks": len(all_chunks),
            "message": f"Indexed {len(file_contents)} files and {len(all_chunks)} chunks",
            "finished_at": time.time(),
        })
        print(f"[Index] Done: {repo_id} — {len(file_contents)} files, {len(all_chunks)} chunks")

    except Exception as e:
        print(f"[Index] Error for {repo_id}: {e}")
        traceback.print_exc()
        _indexing_jobs[repo_id].update({"status": "error", "message": str(e)})


# ─── Endpoints ─────────────────────────────────────────────────────────────

@app.post("/build_embeddings")
def build_embeddings(req: BuildEmbeddingsRequest, background_tasks: BackgroundTasks):
    branch = req.branch or get_default_branch(req.owner, req.repo)
    repo_id = get_repo_id(req.owner, req.repo, branch)

    if check_if_indexed(req.owner, req.repo, branch):
        return {"status": "skipped", "repo_id": repo_id, "message": "Already indexed"}

    if _indexing_jobs.get(repo_id, {}).get("status") == "indexing":
        return {"status": "already_running", "repo_id": repo_id}

    _indexing_jobs[repo_id] = {
        "status": "queued", "message": "Queued for indexing...", "started_at": time.time()
    }
    background_tasks.add_task(_do_build_embeddings, req.owner, req.repo, branch, repo_id)
    return {"status": "started", "repo_id": repo_id}


@app.get("/index_status/{owner}/{repo}")
def index_status(owner: str, repo: str):
    branch = get_default_branch(owner, repo)
    repo_id = get_repo_id(owner, repo, branch)

    if repo_id in _indexing_jobs:
        return _indexing_jobs[repo_id]

    if check_if_indexed(owner, repo, branch):
        return {"status": "done", "message": "Already indexed", "num_files": 0, "num_chunks": 0}

    return {"status": "not_started", "message": "Repository not indexed yet"}


@app.post("/query", response_model=QueryResponse)
def query_repo(req: QueryRequest):
    try:
        branch = req.branch or get_default_branch(req.owner, req.repo)
        repo_id = get_repo_id(req.owner, req.repo, branch)
        print(f"[Query] {repo_id}: {req.question[:60]}")

        query_emb = get_embeddings([req.question])[0]
        ensure_collections()
        client = get_qdrant_client()

        # Stage 1: find relevant files
        file_results = client.query_points(
            collection_name=FILES_COLLECTION,
            query=query_emb,
            query_filter=Filter(
                must=[FieldCondition(key="repo_id", match=MatchValue(value=repo_id))]
            ),
            limit=req.top_files,
            with_payload=True,
        )
        file_paths = [r.payload["file_path"] for r in file_results.points if r.payload.get("file_path")]

        if not file_paths:
            # No index yet — answer immediately from context so the user isn't kept waiting.
            # Background indexing (started by the extension) will make future queries use RAG.
            print(f"[Query] No index for {repo_id}, answering from file tree + README")
            return _answer_from_context(req.owner, req.repo, req.question)

        # Stage 2: find relevant chunks within those files
        per_file = max(1, req.top_chunks // len(file_paths))
        chunk_hits: List[Dict[str, Any]] = []
        for path in file_paths:
            results = client.query_points(
                collection_name=CHUNKS_COLLECTION,
                query=query_emb,
                query_filter=Filter(
                    must=[
                        FieldCondition(key="repo_id", match=MatchValue(value=repo_id)),
                        FieldCondition(key="file_path", match=MatchValue(value=path)),
                    ]
                ),
                limit=per_file,
                with_payload=True,
            )
            for r in results.points:
                chunk_hits.append({
                    "doc": r.payload.get("text", ""),
                    "meta": r.payload,
                    "dist": 1 - r.score,
                })

        chunk_hits.sort(key=lambda x: x["dist"])
        top_chunks = chunk_hits[: req.top_chunks]

        if not top_chunks:
            print(f"[Query] Files indexed but no chunks for {repo_id}, falling back to context")
            return _answer_from_context(req.owner, req.repo, req.question)

        context = "\n\n".join(
            f"[{i+1}] {item['meta']['file_path']}:{item['meta']['start_line']}-{item['meta']['end_line']}\n{item['doc']}"
            for i, item in enumerate(top_chunks)
        )
        answer = _call_llm(req.question, context)

        seen: set = set()
        refs: List[Reference] = []
        for item in top_chunks:
            m = item["meta"]
            key = (m["file_path"], m["start_line"], m["end_line"])
            if key in seen:
                continue
            seen.add(key)
            refs.append(Reference(
                file_path=m["file_path"],
                start_line=int(m["start_line"]),
                end_line=int(m["end_line"]),
                url=(
                    f"https://github.com/{m['owner']}/{m['repo']}"
                    f"/blob/{m['branch']}/{m['file_path']}"
                    f"#L{m['start_line']}-L{m['end_line']}"
                ),
            ))

        print(f"[Query] Done — {len(refs)} references")
        return QueryResponse(answer=answer, references=refs)

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Internal server error: {e}")


def _answer_from_context(owner: str, repo: str, question: str) -> QueryResponse:
    """Fast answer (~2-4s) using README + file tree + key config files.
    Used before indexing completes — works even when there is no README.
    Returns real Reference objects so citation badges are clickable.
    """
    numbered_parts: List[str] = []   # context blocks labelled [1], [2], ...
    refs: List[Reference] = []        # matching Reference for each block

    branch = "main"
    try:
        branch = get_default_branch(owner, repo)
    except Exception:
        pass

    # [1] README (optional)
    try:
        r = http_requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/readme",
            headers={"Accept": "application/vnd.github.v3.raw"},
            timeout=8,
        )
        if r.ok and r.text.strip():
            idx = len(numbered_parts) + 1
            numbered_parts.append(f"[{idx}] README.md:\n{r.text[:3000]}")
            refs.append(Reference(
                file_path="README.md",
                start_line=1,
                end_line=min(100, r.text.count("\n") + 1),
                url=f"https://github.com/{owner}/{repo}/blob/{branch}/README.md",
            ))
    except Exception:
        pass

    # [next] File tree
    items: List[str] = []
    try:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"
        tree_r = http_requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
            headers=headers, timeout=10,
        )
        if tree_r.ok:
            items = [i["path"] for i in tree_r.json().get("tree", []) if i.get("type") == "blob"]

            ext_to_lang = {
                ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript",
                ".tsx": "TypeScript/React", ".jsx": "JavaScript/React",
                ".java": "Java", ".go": "Go", ".rs": "Rust",
                ".cpp": "C++", ".cc": "C++", ".c": "C", ".cs": "C#",
                ".rb": "Ruby", ".php": "PHP", ".swift": "Swift",
                ".kt": "Kotlin", ".scala": "Scala", ".r": "R",
                ".sh": "Shell", ".html": "HTML", ".css": "CSS",
            }
            skip_exts = {".md", ".txt", ".json", ".yaml", ".yml", ".toml",
                         ".lock", ".sum", ".mod", ".gitignore", ".env"}
            ext_counts: Dict[str, int] = {}
            for path in items:
                _, ext = os.path.splitext(path.lower())
                if ext and ext not in skip_exts:
                    ext_counts[ext] = ext_counts.get(ext, 0) + 1

            top = sorted(ext_counts.items(), key=lambda x: -x[1])[:6]
            langs = [ext_to_lang.get(e, e.lstrip(".").upper()) for e, _ in top if e in ext_to_lang]

            idx = len(numbered_parts) + 1
            numbered_parts.append(
                f"[{idx}] Repository structure ({owner}/{repo}):\n"
                f"Total files: {len(items)}\n"
                f"Languages: {', '.join(langs) if langs else 'not detected'}\n"
                f"File tree (first 60):\n" + "\n".join(items[:60])
            )
            refs.append(Reference(
                file_path=f"{owner}/{repo} (file tree)",
                start_line=1,
                end_line=1,
                url=f"https://github.com/{owner}/{repo}",
            ))
    except Exception:
        pass

    # [next+] Config files
    config_priority = [
        "package.json", "requirements.txt", "pyproject.toml",
        "go.mod", "Cargo.toml", "pom.xml", "build.gradle",
        "Gemfile", "composer.json", "setup.py",
    ]
    fetched = 0
    for cfg in config_priority:
        if fetched >= 2:
            break
        matches = [p for p in items if os.path.basename(p) == cfg and p.count("/") <= 1]
        if matches:
            try:
                cr = http_requests.get(
                    f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{matches[0]}",
                    timeout=6,
                )
                if cr.ok and len(cr.text) < 8000:
                    idx = len(numbered_parts) + 1
                    numbered_parts.append(f"[{idx}] {matches[0]}:\n{cr.text[:2000]}")
                    refs.append(Reference(
                        file_path=matches[0],
                        start_line=1,
                        end_line=min(80, cr.text.count("\n") + 1),
                        url=f"https://github.com/{owner}/{repo}/blob/{branch}/{matches[0]}",
                    ))
                    fetched += 1
            except Exception:
                pass

    if not numbered_parts:
        numbered_parts.append(f"Repository: {owner}/{repo} — no additional information could be retrieved.")

    answer = _call_llm(question, "\n\n---\n\n".join(numbered_parts))
    return QueryResponse(answer=answer, references=refs)


def _call_llm(question: str, context: str) -> str:
    try:
        from groq import Groq
        api_key = GROQ_API_KEY or os.environ.get("API_KEY")
        if not api_key:
            return "No LLM API key configured.\n\n" + context
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise code assistant. Answer using only the provided context. "
                        "Cite sources inline as [n] matching the context block numbers. Be concise and technical."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Context:\n\n{context}\n\nQuestion: {question}\n\nAnswer:",
                },
            ],
            model="openai/gpt-oss-120b",
            temperature=0.2,
            stream=False,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"LLM call failed: {e}\n\nRelevant context:\n\n{context}"


@app.post("/summarize")
def summarize_repo(info: RepoInfo):
    branch = get_default_branch(info.owner, info.repo)

    if not check_if_indexed(info.owner, info.repo, branch):
        try:
            repo_id = get_repo_id(info.owner, info.repo, branch)
            _indexing_jobs[repo_id] = {"status": "indexing", "message": "Starting...", "started_at": time.time()}
            _do_build_embeddings(info.owner, info.repo, branch, repo_id)
        except Exception as e:
            print(f"[Summarize] Index failed: {e}, using README fallback")
            return _fallback_readme_summary(info)

    try:
        readme = ""
        try:
            r = http_requests.get(
                f"https://api.github.com/repos/{info.owner}/{info.repo}/readme",
                headers={"Accept": "application/vnd.github.v3.raw"},
                timeout=15,
            )
            if r.ok:
                readme = r.text[:2000]
        except Exception:
            pass

        arch_ctx = _query_for_summary(
            info.owner, info.repo, branch,
            "What is the main architecture, frameworks, and key technical components?",
            top_chunks=15,
        )
        struct_ctx = _query_for_summary(
            info.owner, info.repo, branch,
            "What are the main entry points, file structure, and project organization?",
            top_chunks=10,
        )

        from groq import Groq
        api_key = GROQ_API_KEY or os.environ.get("API_KEY")
        if not api_key:
            return {"summary": "API key not configured", "project_paper": ""}

        client = Groq(api_key=api_key)

        summary = client.chat.completions.create(
            messages=[{"role": "user", "content": (
                f"Summarize {info.owner}/{info.repo} in 2-3 paragraphs based on the code analysis.\n\n"
                f"Description: {info.description}\nREADME: {readme}\n"
                f"Architecture: {arch_ctx[:3000]}\nStructure: {struct_ctx[:2000]}\n\n"
                "Be specific and technical. Focus on what it does, main technologies, and architecture."
            )}],
            model="openai/gpt-oss-120b",
            temperature=0.3,
            stream=False,
        ).choices[0].message.content

        project_paper = client.chat.completions.create(
            messages=[{"role": "user", "content": (
                f"Create a comprehensive one-page overview of {info.owner}/{info.repo}.\n\n"
                f"Description: {info.description}\nREADME: {readme}\n"
                f"Architecture: {arch_ctx[:4000]}\nStructure: {struct_ctx[:2500]}\n\n"
                "Sections: Purpose, Technical Architecture, Key Technologies, Main Features, "
                "File Structure, How to Run, Development Setup."
            )}],
            model="openai/gpt-oss-120b",
            temperature=0.3,
            stream=False,
        ).choices[0].message.content

        return {"summary": summary, "project_paper": project_paper, "indexed": True, "branch": branch}

    except Exception as e:
        print(f"[Summarize] Error: {e}")
        return _fallback_readme_summary(info)


def _query_for_summary(owner: str, repo: str, branch: str, question: str, top_chunks: int = 15) -> str:
    try:
        repo_id = get_repo_id(owner, repo, branch)
        query_emb = get_embeddings([question])[0]
        ensure_collections()
        client = get_qdrant_client()

        file_results = client.query_points(
            collection_name=FILES_COLLECTION,
            query=query_emb,
            query_filter=Filter(
                must=[FieldCondition(key="repo_id", match=MatchValue(value=repo_id))]
            ),
            limit=10,
            with_payload=True,
        )
        file_paths = [r.payload["file_path"] for r in file_results.points if r.payload.get("file_path")]

        per_file = max(1, top_chunks // max(1, len(file_paths)))
        chunks = []
        for path in file_paths:
            results = client.query_points(
                collection_name=CHUNKS_COLLECTION,
                query=query_emb,
                query_filter=Filter(
                    must=[
                        FieldCondition(key="repo_id", match=MatchValue(value=repo_id)),
                        FieldCondition(key="file_path", match=MatchValue(value=path)),
                    ]
                ),
                limit=per_file,
                with_payload=True,
            )
            for r in results.points:
                m = r.payload
                chunks.append(
                    f"{m.get('file_path')}:{m.get('start_line')}-{m.get('end_line')}\n{m.get('text', '')}"
                )

        return "\n\n".join(chunks[:top_chunks]) or "No relevant code context found."
    except Exception as e:
        return f"Error retrieving context: {e}"


def _fallback_readme_summary(info: RepoInfo):
    readme = ""
    try:
        r = http_requests.get(
            f"https://api.github.com/repos/{info.owner}/{info.repo}/readme",
            headers={"Accept": "application/vnd.github.v3.raw"},
            timeout=15,
        )
        if r.ok:
            readme = r.text
    except Exception:
        pass

    from groq import Groq
    api_key = GROQ_API_KEY or os.environ.get("API_KEY")
    if not api_key:
        return {"summary": "API key not configured", "project_paper": ""}

    client = Groq(api_key=api_key)
    summary = client.chat.completions.create(
        messages=[{"role": "user", "content": (
            f"Summarize {info.owner}/{info.repo}:\n"
            f"Description: {info.description}\nREADME: {readme[:2000]}"
        )}],
        model="openai/gpt-oss-120b",
        stream=False,
    ).choices[0].message.content

    project_paper = client.chat.completions.create(
        messages=[{"role": "user", "content": (
            f"Create a project overview for {info.owner}/{info.repo}:\n"
            f"Description: {info.description}\nREADME: {readme[:4000]}"
        )}],
        model="openai/gpt-oss-120b",
        stream=False,
    ).choices[0].message.content

    return {"summary": summary, "project_paper": project_paper, "indexed": False}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
