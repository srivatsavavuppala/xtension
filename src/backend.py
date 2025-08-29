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

class TreeRequest(BaseModel):
    repo: str
    owner: str
    branch: str = "main"

@app.get("/tree/{owner}/{repo}")
async def get_repo_tree(owner: str, repo: str, branch: str = "main"):
    try:
        # Fetch the Git tree from GitHub API
        response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
            headers={"Accept": "application/vnd.github.v3+json"},
            timeout=15
        )
        response.raise_for_status()
        data = response.json()
        
        if data.get("truncated", False):
            return {"error": "Repository too large to fetch complete tree"}
        
        # Process and structure the tree data
        tree = data.get("tree", [])
        structured_tree = []
        
        for item in tree:
            path = item["path"]
            type = "folder" if item["type"] == "tree" else "file"
            
            # Skip certain files and directories
            if any(skip in path.lower() for skip in [".git", "node_modules", "__pycache__"]):
                continue
                
            structured_tree.append({
                "path": path,
                "type": type,
                "size": item.get("size", 0) if type == "file" else None,
                "url": item.get("url", "")
            })
            
        return {
            "tree": structured_tree,
            "sha": data.get("sha", ""),
            "truncated": data.get("truncated", False)
        }
        
    except requests.RequestException as e:
        return {"error": f"Failed to fetch repository tree: {str(e)}"}

@app.post("/summarize")
def summarize_repo(info: RepoInfo):
    # Fetch README from GitHub
    readme = ""
    try:
        r = requests.get(f"https://api.github.com/repos/{info.owner}/{info.repo}/readme", 
                        headers={"Accept": "application/vnd.github.v3.raw"}, 
                        timeout=15)
        if r.ok:
            readme = r.text
    except Exception:
        pass

    # Fetch and process repository tree
    try:
        tree_response = requests.get(
            f"https://api.github.com/repos/{info.owner}/{info.repo}/git/trees/main?recursive=1",
            headers={"Accept": "application/vnd.github.v3+json"},
            timeout=15
        )
        tree_data = None
        if tree_response.ok:
            tree_json = tree_response.json()
            if not tree_json.get("truncated", False):
                # Process the tree into a hierarchical structure
                root = {
                    "name": info.repo,
                    "type": "directory",
                    "icon": "📁",
                    "children": []
                }
                
                # Create a dictionary to hold all paths
                path_dict = {}
                
                # First pass: create all directory nodes
                for item in tree_json.get("tree", []):
                    path = item["path"]
                    parts = path.split("/")
                    
                    # Skip unwanted files/directories
                    if any(skip in path.lower() for skip in [".git", "node_modules", "__pycache__"]):
                        continue
                    
                    # Create directory nodes for each part of the path
                    current_path = ""
                    for i, part in enumerate(parts[:-1]):
                        parent_path = "/".join(parts[:i])
                        current_path = "/".join(parts[:i+1])
                        
                        if current_path not in path_dict:
                            new_node = {
                                "name": part,
                                "type": "directory",
                                "icon": "📁",
                                "children": []
                            }
                            path_dict[current_path] = new_node
                            
                            # Add to parent
                            if parent_path:
                                parent = path_dict[parent_path]
                                parent["children"].append(new_node)
                            else:
                                root["children"].append(new_node)
                
                # Second pass: add all files
                for item in tree_json.get("tree", []):
                    if item["type"] != "blob":
                        continue
                        
                    path = item["path"]
                    parts = path.split("/")
                    
                    # Skip unwanted files
                    if any(skip in path.lower() for skip in [".git", "node_modules", "__pycache__"]):
                        continue
                    
                    file_node = {
                        "name": parts[-1],
                        "type": "file",
                        "icon": "📄",
                        "children": []
                    }
                    
                    # Add file to its parent directory
                    parent_path = "/".join(parts[:-1])
                    if parent_path:
                        parent = path_dict.get(parent_path)
                        if parent:
                            parent["children"].append(file_node)
                    else:
                        root["children"].append(file_node)
                
                tree_data = root
    except Exception:
        tree_data = None

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
        "project_paper": data.get("project_paper", ""),
        "tree_data": tree_data,
        "owner": info.owner,
        "repo": info.repo,
        "description": info.description
    }