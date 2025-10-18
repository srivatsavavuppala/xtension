from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Tuple
import os
import time
import hashlib
import requests
import numpy as np

# RAG dependencies
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
except Exception:  # pragma: no cover
    chromadb = None
    ChromaSettings = None

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover
    SentenceTransformer = None

# You can set your API URL here (pointing to the ai backend)
AI_BACKEND_URL = "https://xtension-alpha.vercel.app/api/summarize"

app = FastAPI()

# Allow CORS for extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepoInfo(BaseModel):
    repo: str
    owner: str
    description: str

@app.post("/summarize")
def summarize_repo(info: RepoInfo):
    # Fetch README from GitHub
    readme = ""
    try:
        r = requests.get(f"https://api.github.com/repos/{info.owner}/{info.repo}/readme", headers={"Accept": "application/vnd.github.v3.raw"}, timeout=15)
        if r.ok:
            readme = r.text
    except Exception:
        pass

    # Fetch file tree from GitHub (optional, for future use)
    # tree = []
    # try:
    #     t = requests.get(f"https://api.github.com/repos/{info.owner}/{info.repo}/git/trees/master?recursive=1", timeout=15)
    #     if t.ok:
    #         tree = t.json().get("tree", [])
    # except Exception:
    #     pass

    summary_prompt = (
        f"Summarize the following GitHub repository in a concise paragraph. "
        f"Focus only on the project's purpose, main features, and how it is organized. "
        f"Ignore any information about funding, badges, external links, or unrelated content.\n\n"
        f"Repository: {info.owner}/{info.repo}\n"
        f"Description: {info.description}\n"
        f"README: {readme[:2000]}"
    )

    paper_prompt = (
        f"Write a one-page project overview for the following GitHub repository. "
        f"Include only the following sections:\n"
        f"- Project Name\n"
        f"- Purpose\n"
        f"- Main Features\n"
        f"- File/Folder Structure (if available)\n"
        f"- Key Technologies Used\n"
        f"- How to Use or Run the Project\n"
        f"- Contribution Guidelines (if available)\n"
        f"- License\n"
        f"Do not include information about funding, badges, external links, or unrelated content. "
        f"Be clear, concise, and professional.\n\n"
        f"Repository: {info.owner}/{info.repo}\n"
        f"Description: {info.description}\n"
        f"README: {readme[:4000]}"
    )

    response = requests.post(
        AI_BACKEND_URL,
        json = {
            "repo": info.repo,
            "owner": info.owner,
            "description": info.description,
            "readme": readme,
            "summary_prompt": summary_prompt,
            "paper_prompt": paper_prompt,
        },
        timeout = 60
    )
    response.raise_for_status()
    data = response.json()
    return {
        "summary": data.get("summary", ""),
        "project_paper": data.get("project_paper", "")
    }

# -----------------------------
# RAG: Retrieval-Augmented Assistant
# -----------------------------

# Configuration
EMBEDDING_MODEL_NAME = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CHROMA_PERSIST_PATH = os.environ.get(
    "CHROMA_PERSIST_PATH",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".rag_store"))
)
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

_embedding_model: Optional[SentenceTransformer] = None
_chroma_client = None


def _ensure_dirs():
    os.makedirs(CHROMA_PERSIST_PATH, exist_ok=True)


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        if SentenceTransformer is None:
            raise HTTPException(status_code=500, detail="sentence-transformers not installed")
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _embedding_model


def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        if chromadb is None:
            raise HTTPException(status_code=500, detail="chromadb not installed")
        _ensure_dirs()
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_PATH)
    return _chroma_client


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
        # Fallback to master
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
    # Filter obvious binaries and large artifacts by extension
    binary_exts = {
        ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
        ".pdf", ".zip", ".gz", ".tar", ".rar", ".7z",
        ".mp4", ".mp3", ".wav", ".woff", ".woff2", ".ttf",
        ".jar", ".bin"
    }
    _, ext = os.path.splitext(path.lower())
    if ext in binary_exts:
        return False
    # Common code/text files
    allow_exts = {
        ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".rb", ".rs",
        ".cpp", ".cc", ".c", ".h", ".hpp", ".cs", ".php", ".swift",
        ".kt", ".kts", ".scala", ".r", ".m", ".mm", ".sh", ".bash", ".zsh",
        ".html", ".css", ".scss", ".less", ".json", ".yml", ".yaml", ".toml",
        ".md", ".txt", ".env", ".ini", ".cfg", ".conf", ".sql"
    }
    # Allow dotfiles like .gitignore, .dockerignore explicitly
    if os.path.basename(path).lower() in {"license", "readme", "readme.md", ".gitignore", ".dockerignore"}:
        return True
    return ext in allow_exts


def fetch_file_content(owner: str, repo: str, branch: str, path: str) -> Optional[str]:
    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
    try:
        r = requests.get(raw_url, timeout=20)
        if r.ok:
            # Skip very large files (> 500 KB)
            if len(r.content) > 500 * 1024:
                return None
            text = r.text
            # Rough filter to avoid binary by presence of NUL byte
            if "\x00" in text:
                return None
            return text
    except Exception:
        return None
    return None


def chunk_code(content: str, min_chars: int = 900, max_chars: int = 1800, overlap_lines: int = 15) -> List[Tuple[str, int, int]]:
    # Chunk by lines while aiming for ~300-500 tokens (~1200-2000 chars)
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
                # allow early stop after reaching min_chars
                pass
            end += 1
        # Ensure at least one line
        if end <= start:
            end = start + 1
        chunk_text = "\n".join(lines[start:end])
        chunks.append((chunk_text, start + 1, end))  # 1-based lines
        # Overlap
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


def get_or_create_collections(repo_id: str):
    client = get_chroma_client()
    files_name = f"files::{repo_id}"
    chunks_name = f"chunks::{repo_id}"
    files_coll = client.get_or_create_collection(name=files_name, metadata={"repo_id": repo_id, "type": "files"})
    chunks_coll = client.get_or_create_collection(name=chunks_name, metadata={"repo_id": repo_id, "type": "chunks"})
    return files_coll, chunks_coll


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


@app.post("/build_embeddings", response_model=BuildEmbeddingsResponse)
def build_embeddings(req: BuildEmbeddingsRequest):
    start_time = time.time()
    branch = req.branch or get_default_branch(req.owner, req.repo)
    repo_id = get_repo_id(req.owner, req.repo, branch)

    # Prepare collections and model
    files_coll, chunks_coll = get_or_create_collections(repo_id)
    model = get_embedding_model()

    # List and fetch files
    files = list_repo_files(req.owner, req.repo, branch)
    num_files = 0
    num_chunks = 0

    # Index files in batches for stability
    file_texts: List[str] = []
    file_ids: List[str] = []
    file_metas: List[Dict[str, Any]] = []

    # First gather file-level content (with size caps)
    for path in files:
        content = fetch_file_content(req.owner, req.repo, branch, path)
        if not content:
            continue
        # Truncate file-level representation to 10k chars for embedding stability
        file_text = content[:10000]
        file_id = sha1_id(repo_id, path)
        file_meta = {
            "repo_id": repo_id,
            "owner": req.owner,
            "repo": req.repo,
            "branch": branch,
            "file_path": path,
        }
        file_texts.append(file_text)
        file_ids.append(file_id)
        file_metas.append(file_meta)
        num_files += 1

    if file_texts:
        file_embs = model.encode(file_texts, convert_to_numpy=True, show_progress_bar=False)
        files_coll.upsert(documents=file_texts, metadatas=file_metas, ids=file_ids, embeddings=file_embs.tolist())

    # Build chunk-level embeddings
    chunk_docs: List[str] = []
    chunk_metas: List[Dict[str, Any]] = []
    chunk_ids: List[str] = []
    for idx, path in enumerate(files):
        content = fetch_file_content(req.owner, req.repo, branch, path)
        if not content:
            continue
        chunks = chunk_code(content)
        for chunk_text, start_line, end_line in chunks:
            cid = sha1_id(repo_id, path, start_line, end_line)
            meta = {
                "repo_id": repo_id,
                "owner": req.owner,
                "repo": req.repo,
                "branch": branch,
                "file_path": path,
                "start_line": start_line,
                "end_line": end_line,
            }
            chunk_docs.append(chunk_text)
            chunk_metas.append(meta)
            chunk_ids.append(cid)
            num_chunks += 1

        # Periodically flush to Chroma to avoid huge payloads
        if len(chunk_docs) >= 200:
            chunk_embs = model.encode(chunk_docs, convert_to_numpy=True, show_progress_bar=False)
            chunks_coll.upsert(documents=chunk_docs, metadatas=chunk_metas, ids=chunk_ids, embeddings=chunk_embs.tolist())
            chunk_docs, chunk_metas, chunk_ids = [], [], []

    if chunk_docs:
        chunk_embs = model.encode(chunk_docs, convert_to_numpy=True, show_progress_bar=False)
        chunks_coll.upsert(documents=chunk_docs, metadatas=chunk_metas, ids=chunk_ids, embeddings=chunk_embs.tolist())

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


def _query_chroma_files(repo_id: str, query_emb: np.ndarray, top_files: int):
    files_coll, _ = get_or_create_collections(repo_id)
    res = files_coll.query(query_embeddings=[query_emb.tolist()], n_results=top_files, where={"repo_id": repo_id})
    return res


def _query_chroma_chunks(repo_id: str, query_emb: np.ndarray, file_paths: List[str], per_file: int) -> List[Dict[str, Any]]:
    _, chunks_coll = get_or_create_collections(repo_id)
    results: List[Dict[str, Any]] = []
    for path in file_paths:
        res = chunks_coll.query(query_embeddings=[query_emb.tolist()], n_results=per_file, where={"repo_id": repo_id, "file_path": path})
        for i in range(len(res.get("ids", [[]])[0])):
            results.append({
                "id": res["ids"][0][i],
                "doc": res["documents"][0][i],
                "meta": res["metadatas"][0][i],
                "dist": res["distances"][0][i] if "distances" in res else None,
            })
    # Sort by distance if available
    results.sort(key=lambda x: x.get("dist", 0.0))
    return results


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
    # Prefer Groq if available as in existing codebase
    try:
        from groq import Groq
        api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("API_KEY")
        if not api_key:
            # Fallback: return extracted context snippet if no LLM key
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
    except Exception as e:  # pragma: no cover
        # Fail open with raw context
        return (
            "LLM call failed. Returning relevant context instead.\n\n"
            + context
            + f"\n\n[error: {e}]"
        )


@app.post("/query", response_model=QueryResponse)
def query_repo(req: QueryRequest):
    branch = req.branch or get_default_branch(req.owner, req.repo)
    repo_id = get_repo_id(req.owner, req.repo, branch)

    # Ensure collections exist (and implicitly that embeddings have been built)
    files_coll, chunks_coll = get_or_create_collections(repo_id)
    # Quick existence check
    try:
        count_files = len(files_coll.get(ids=[]).get("ids", []))  # noop call returns empty
    except Exception:
        pass

    # Embed query
    model = get_embedding_model()
    query_emb = model.encode([req.question], convert_to_numpy=True, show_progress_bar=False)[0]

    # Stage 1: retrieve relevant files
    file_res = _query_chroma_files(repo_id, query_emb, req.top_files)
    file_paths: List[str] = []
    if file_res and file_res.get("metadatas"):
        for meta in file_res["metadatas"][0]:
            if meta and meta.get("file_path"):
                file_paths.append(meta["file_path"])

    # Stage 2: retrieve relevant chunks within those files
    per_file = max(1, req.top_chunks // max(1, len(file_paths) or 1))
    chunk_hits = _query_chroma_chunks(repo_id, query_emb, file_paths, per_file)
    top_chunks = chunk_hits[: req.top_chunks]

    if not top_chunks:
        return QueryResponse(answer="No relevant code found for your question.", references=[])

    # Compose context
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
