# GitHub Repo Summarizer Backend (Vercel-ready)

This is a FastAPI backend for the GitHub Repo Summarizer Chrome Extension, ready to deploy on Vercel as a Python serverless API.

## Project Structure

```
xtension/
├── api/
│   └── index.py         # FastAPI app (entry point for Vercel)
├── requirements.txt     # Python dependencies
├── README.md            # This file
```

## How to Deploy on Vercel

1. **Push this folder to a GitHub repository.**
2. **Go to [vercel.com](https://vercel.com/), sign up/log in, and create a new project.**
3. **Import your GitHub repo.**
4. **Vercel will auto-detect the `api/` directory and Python API.**
5. **Set your environment variable `API_KEY` (your Groq key) in the Vercel dashboard.**
6. **Deploy!**

Your API will be available at:
```
https://your-vercel-project.vercel.app/api/summarize
```

Update your Chrome extension to use this URL for summarization.
