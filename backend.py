from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests

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
    readme: str = ""
@app.post("/summarize")
def summarize_repo(info: RepoInfo):
    summary_prompt = (
        f"Summarize the following GitHub repository in a concise paragraph. "
        f"Focus only on the project's purpose, main features, and how it is organized. "
        f"Ignore any information about funding, badges, external links, or unrelated content.\\n\\n"
        f"Repository: {info.owner}/{info.repo}\\n"
        f"Description: {info.description}\\n"
        f"README: {info.readme[:2000]}"
    )

    paper_prompt = (
        f"Write a one-page project overview for the following GitHub repository. "
        f"Include only the following sections:\\n"
        f"- Project Name\\n"
        f"- Purpose\\n"
        f"- Main Features\\n"
        f"- File/Folder Structure (if available)\\n"
        f"- Key Technologies Used\\n"
        f"- How to Use or Run the Project\\n"
        f"- Contribution Guidelines (if available)\\n"
        f"- License\\n"
        f"Do not include information about funding, badges, external links, or unrelated content. "
        f"Be clear, concise, and professional.\\n\\n"
        f"Repository: {info.owner}/{info.repo}\\n"
        f"Description: {info.description}\\n"
        f"README: {info.readme[:4000]}"
    )
    
    response = requests.post(
        AI_BACKEND_URL,
        json = {
            "repo": info.repo,
            "owner": info.owner,
            "description": info.description,
            "readme": info.readme,
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