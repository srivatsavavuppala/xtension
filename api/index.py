from http.server import BaseHTTPRequestHandler
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import requests
from groq import Groq

app = FastAPI()

class FileInfo(BaseModel):
    path: str
    type: str
    size: Optional[int]

class RepoInfo(BaseModel):
    repo: str
    owner: str
    description: str
    readme: str = ""
    structure: List[FileInfo] = []

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_GET(self):
        """Health check endpoint"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "status": "GitHub Repo Summarizer API is running",
            "version": "1.0"
        }
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests for summarization"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error_response(400, "Invalid JSON")
                return
            
            # Validate required fields
            required_fields = ['repo', 'owner', 'description']
            for field in required_fields:
                if field not in data:
                    self.send_error_response(400, f"Missing required field: {field}")
                    return
            
            # Initialize Groq client
            api_key = os.environ.get("API_KEY")
            if not api_key:
                self.send_error_response(500, "API_KEY environment variable not set")
                return
            
            client = Groq(api_key=api_key)
            
            # Create a formatted file structure string
            structure_text = "Repository Structure:\n"
            if data.get('structure') and len(data.get('structure', [])) > 0:
                for file in data.get('structure', []):
                    prefix = "📁 " if file['type'] == "tree" else "📄 "
                    structure_text += f"{prefix}{file['path']}\n"
            else:
                structure_text = "Repository Structure:\n📁 No detailed file structure available\n📄 Repository content will be analyzed based on available information\n"

            # Generate summary with better context handling
            summary_prompt = (
                f"Summarize the following GitHub repository in a concise paragraph. "
                f"Focus on the project's purpose, main features, and organization. "
                f"Use the available information to provide the best possible summary.\n\n"
                f"Repository: {data['owner']}/{data['repo']}\n"
                f"Description: {data['description']}\n\n"
                f"{structure_text}\n\n"
                f"README: {data.get('readme', '')[:2000] if data.get('readme') else 'No README content available'}\n\n"
                f"Instructions: Based on the repository name, owner, description, and any available content, "
                f"provide a comprehensive summary that explains what this project does, its main purpose, "
                f"and key characteristics. If specific technical details aren't available, make reasonable "
                f"inferences based on the repository name and description."
            )
            
            summary_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": summary_prompt}],
                model="llama-3.3-70b-versatile",
                stream=False,
            )
            summary = summary_completion.choices[0].message.content
            
            # Generate project paper
            paper_prompt = (
                f"Write a one-page project overview for the following GitHub repository. "
                f"Include these sections:\n"
                f"- Project Name and Purpose\n"
                f"- Main Features\n"
                f"- Technical Architecture (analyzing available information)\n"
                f"- Key Technologies Used (inferred from repository context)\n"
                f"- How to Use or Run the Project\n"
                f"- Contribution Guidelines\n"
                f"- License\n\n"
                f"Repository Info:\n"
                f"Owner: {data['owner']}\n"
                f"Repo: {data['repo']}\n"
                f"Description: {data['description']}\n\n"
                f"{structure_text}\n\n"
                f"README: {data.get('readme', '')[:4000] if data.get('readme') else 'No README content available'}\n\n"
                f"Instructions: Create a comprehensive project overview based on the available information. "
                f"If specific technical details aren't available, make reasonable inferences based on the "
                f"repository name, description, and common patterns in software development. "
                f"Focus on providing valuable insights that would help developers understand and use this project."
            )
            
            paper_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": paper_prompt}],
                model="llama-3.3-70b-versatile",
                stream=False,
            )
            project_paper = paper_completion.choices[0].message.content
            
            try:
                headers = {}
                if os.environ.get("GITHUB_TOKEN"):
                    headers["Authorization"] = f"token {os.environ.get('GITHUB_TOKEN')}"
                
                tree_response = requests.get(
                    f"https://api.github.com/repos/{data['owner']}/{data['repo']}/git/trees/main?recursive=1",
                    headers={"Accept": "application/vnd.github.v3+json", **headers},
                    timeout=15
                )
                
                if tree_response.ok:
                    tree_json = tree_response.json()
                    if not tree_json.get("truncated", False):
                        # Initialize root directory
                        tree_data = {
                            "name": data['repo'],
                            "type": "directory",
                            "icon": "📁",
                            "children": []
                        }
                        
                        # Create directory mapping to handle nested structure
                        dir_mapping = {"": tree_data}
                        
                        # Process all items in tree
                        items = tree_json.get("tree", [])
                        
                        # Sort items to process directories first
                        items.sort(key=lambda x: (x["type"] != "tree", x["path"]))
                        
                        for item in items:
                            path = item["path"]
                            parts = path.split("/")
                            
                            # Skip unwanted files/directories
                            if any(skip in path.lower() for skip in [".git/", "node_modules/", "__pycache__/"]):
                                continue
                            
                            is_dir = item["type"] == "tree"
                            parent_path = "/".join(parts[:-1])
                            
                            if is_dir:
                                # Create directory node
                                dir_node = {
                                    "name": parts[-1],
                                    "type": "directory",
                                    "icon": "📁",
                                    "children": []
                                }
                                dir_mapping[path] = dir_node
                                
                                # Add to parent
                                parent = dir_mapping.get(parent_path, tree_data)
                                parent["children"].append(dir_node)
                            else:
                                # Create file node
                                file_node = {
                                    "name": parts[-1],
                                    "type": "file",
                                    "icon": "�",
                                    "children": []
                                }
                                
                                # Add to parent
                                parent = dir_mapping.get(parent_path, tree_data)
                                parent["children"].append(file_node)
                        
                        # Sort children in each directory
                        def sort_tree(node):
                            if node["children"]:
                                node["children"].sort(key=lambda x: (x["type"] != "directory", x["name"].lower()))
                                for child in node["children"]:
                                    sort_tree(child)
                        
                        sort_tree(tree_data)
                    else:
                        tree_data = {
                            "name": data['repo'],
                            "type": "directory",
                            "icon": "📁",
                            "children": [{
                                "name": "Repository too large",
                                "type": "file",
                                "icon": "⚠️",
                                "children": []
                            }]
                        }
                else:
                    tree_data = {
                        "name": data['repo'],
                        "type": "directory",
                        "icon": "📁",
                        "children": [{
                            "name": "Failed to fetch repository structure",
                            "type": "file",
                            "icon": "❌",
                            "children": []
                        }]
                    }
            except Exception as e:
                tree_data = {
                    "name": data['repo'],
                    "type": "directory",
                    "icon": "�",
                    "children": [{
                        "name": f"Error: {str(e)}",
                        "type": "file",
                        "icon": "⚠️",
                        "children": []
                    }]
                }
            
            # Send successful response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "summary": summary,
                "project_paper": project_paper,
                "tree_data": tree_data,
                "owner": data['owner'],
                "repo": data['repo'],
                "description": data['description']
            }
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error_response(500, f"Internal server error: {str(e)}")
    
    def send_error_response(self, status_code, message):
        """Send error response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_response = {"error": message}
        self.wfile.write(json.dumps(error_response).encode())