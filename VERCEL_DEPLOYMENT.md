# Vercel Deployment Guide

This repository contains **two separate API endpoints** that can be deployed together on Vercel:

## 📍 Endpoints

### 1. **Summarization API** (`/api/` or `/api/index`)
- **File**: `api/index.py`
- **Purpose**: Simple repository summarization using Groq LLM
- **Methods**: GET, POST
- **Routes**: 
  - `GET /api/` - Health check
  - `POST /api/` - Generate repository summary

### 2. **RAG API** (`/api/rag/*`)
- **File**: `api/rag.py`
- **Purpose**: Full RAG (Retrieval-Augmented Generation) system with embeddings, Pinecone, and advanced querying
- **Methods**: GET, POST, PUT, DELETE
- **Routes**:
  - `GET /api/rag/` - Root endpoint
  - `POST /api/rag/build_embeddings` - Build embeddings for a repository
  - `POST /api/rag/query` - Query repository with RAG
  - `POST /api/rag/summarize` - Advanced summarization with RAG

## 🚀 Deployment

### Prerequisites
1. Vercel account
2. All environment variables configured (see below)

### Steps

1. **Connect Repository to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables**

   In Vercel dashboard → Project Settings → Environment Variables, add:

   **Required for both endpoints:**
   - `GROQ_API_KEY` or `API_KEY` - Groq API key for LLM
   - `GITHUB_TOKEN` - GitHub personal access token (optional but recommended)

   **Required for RAG endpoint only:**
   - `PINECONE_API_KEY` - Pinecone API key
   - `PINECONE_ENVIRONMENT` - Pinecone environment (default: `us-east-1`)
   - `PINECONE_FILES_INDEX` - Pinecone index name for files (default: `xtension-files`)
   - `PINECONE_CHUNKS_INDEX` - Pinecone index name for chunks (default: `xtension-chunks`)

   **Optional for RAG endpoint:**
   - `EMBEDDING_MODEL` - Sentence transformer model (default: `all-MiniLM-L6-v2`)
   - `PINECONE_MAX_INDEXES` - Maximum Pinecone indexes (default: `5`)
   - `ALLOWED_ORIGINS` - Comma-separated list of allowed origins for CORS
   - `VERCEL_ALLOWED_DOMAIN` - Single allowed domain for CORS

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration

### `vercel.json`
The `vercel.json` file configures both endpoints:
- Both use Python 3.9 runtime
- Each file in `api/` automatically becomes an endpoint

### File Structure
```
/
├── api/
│   ├── index.py          # Summarization API
│   ├── rag.py            # RAG API wrapper
│   └── requirements.txt  # Python dependencies
├── src/
│   └── backend.py        # FastAPI app (imported by rag.py)
└── vercel.json           # Vercel configuration
```

## 📝 Usage Examples

### Summarization API
```bash
# Health check
curl https://your-project.vercel.app/api/

# Generate summary
curl -X POST https://your-project.vercel.app/api/ \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "octocat",
    "repo": "Hello-World",
    "description": "My first repository"
  }'
```

### RAG API
```bash
# Root endpoint
curl https://your-project.vercel.app/api/rag/

# Build embeddings
curl -X POST https://your-project.vercel.app/api/rag/build_embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "octocat",
    "repo": "Hello-World"
  }'

# Query repository
curl -X POST https://your-project.vercel.app/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "octocat",
    "repo": "Hello-World",
    "question": "How does authentication work?"
  }'
```

## 🔐 Security

The RAG API supports origin restriction via environment variables:
- Set `ALLOWED_ORIGINS` or `VERCEL_ALLOWED_DOMAIN` to restrict access
- Requests from non-allowed origins will receive HTTP 403

## 🐛 Troubleshooting

### Import Errors
If you see import errors for `backend.py`:
- Ensure `src/backend.py` exists
- Check that `api/rag.py` correctly adds `src/` to Python path

### Timeout Issues
- Vercel serverless functions have a 10s timeout on Hobby plan
- Consider upgrading for longer execution times
- RAG operations (especially embedding generation) can be slow

### Dependency Issues
- Ensure `api/requirements.txt` includes all dependencies
- Large packages like `sentence-transformers` and `torch` may increase cold start time

## 📚 Additional Resources

- [Vercel Python Runtime Docs](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Mangum Documentation](https://mangum.io/)
