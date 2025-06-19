from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from groq import Groq

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
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
    readme: str = ""

# Initialize Groq client
GROQ_API_KEY = os.environ.get("API_KEY")
if not GROQ_API_KEY:
    raise ValueError("API_KEY environment variable is required")

client = Groq(api_key=GROQ_API_KEY)

def handler(request):
    """Main handler for Vercel serverless function"""
    return app(request)

@app.post("/")
async def summarize_repo(info: RepoInfo):
    try:
        summary_prompt = (
            f"Summarize the following GitHub repository in a concise paragraph. "
            f"Focus only on the project's purpose, main features, and how it is organized. "
            f"Ignore any information about funding, badges, external links, or unrelated content.\n\n"
            f"Repository: {info.owner}/{info.repo}\n"
            f"Description: {info.description}\n"
            f"README: {info.readme[:2000]}"
        )
        
        summary_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": summary_prompt}],
            model="llama-3.3-70b-versatile",
            stream=False,
        )
        summary = summary_completion.choices[0].message.content

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
            f"README: {info.readme[:4000]}"
        )
        
        paper_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": paper_prompt}],
            model="llama-3.3-70b-versatile",
            stream=False,
        )
        project_paper = paper_completion.choices[0].message.content

        return {"summary": summary, "project_paper": project_paper}
    
    except Exception as e:
        return {"error": f"Failed to generate summary: {str(e)}"}

@app.get("/")
async def health_check():
    return {"status": "GitHub Repo Summarizer API is running", "version": "1.0"}