from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from groq import Groq

app = FastAPI()

class RepoInfo(BaseModel):
    repo: str
    owner: str
    description: str
    readme: str = ""

GROQ_API_KEY = os.environ.get("API_KEY")
client = Groq(api_key=GROQ_API_KEY)

@app.post("/api/summarize")
async def summarize_repo(info: RepoInfo, request: Request):
    # ... your summarization logic ...
    summary_prompt = (
        f"Summarize the following GitHub repository in a concise paragraph. "
        f"Focus only on the project's purpose, main features, and how it is organized. "
        f"Ignore any information about funding, badges, external links, or unrelated content.\\n\\n"
        f"Repository: {info.owner}/{info.repo}\\n"
        f"Description: {info.description}\\n"
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
    paper_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": paper_prompt}],
        model="llama-3.3-70b-versatile",
        stream=False,
    )
    project_paper = paper_completion.choices[0].message.content

    # Add CORS headers manually
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
    return JSONResponse(
        content={"summary": summary, "project_paper": project_paper},
        headers=headers
    )

# Handle preflight OPTIONS requests
@app.options("/api/summarize")
async def options_handler(request: Request):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
    return JSONResponse(content={}, headers=headers)