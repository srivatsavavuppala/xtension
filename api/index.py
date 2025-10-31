from http.server import BaseHTTPRequestHandler
import json
import os
import requests
from groq import Groq

class handler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers for all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With')
        self.send_header('Access-Control-Max-Age', '86400')
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
        return
    
    def do_GET(self):
        """Health check endpoint"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        response = {
            "status": "GitHub Repo Summarizer API is running",
            "version": "1.0",
            "cors_enabled": True
        }
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests for summarization"""
        # Handle CORS preflight
        if self.command == 'OPTIONS':
            self.do_OPTIONS()
            return
            
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error_response(400, "Empty request body")
                return
                
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError as e:
                self.send_error_response(400, f"Invalid JSON: {str(e)}")
                return
            
            # Validate required fields
            required_fields = ['repo', 'owner', 'description']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                self.send_error_response(400, f"Missing required fields: {', '.join(missing_fields)}")
                return
            
            # Initialize Groq client
            api_key = os.environ.get("API_KEY") or os.environ.get("GROQ_API_KEY")
            if not api_key:
                self.send_error_response(500, "API_KEY or GROQ_API_KEY environment variable not set")
                return
            
            client = Groq(api_key=api_key)
            
            # Create a formatted file structure string
            structure_text = "Repository Structure:\n"
            if data.get('structure') and len(data.get('structure', [])) > 0:
                for file in data.get('structure', []):
                    prefix = "📁 " if file.get('type') == "tree" else "📄 "
                    structure_text += f"{prefix}{file.get('path', 'unknown')}\n"
            else:
                structure_text = "Repository Structure:\n📁 No detailed file structure available\n"

            # Generate summary
            summary_prompt = (
                f"Summarize the following GitHub repository in a concise paragraph. "
                f"Focus on the project's purpose, main features, and organization.\n\n"
                f"Repository: {data['owner']}/{data['repo']}\n"
                f"Description: {data['description']}\n\n"
                f"{structure_text}\n\n"
                f"README: {data.get('readme', 'No README available')[:2000]}\n\n"
                f"Provide a comprehensive summary explaining what this project does and its key characteristics."
            )
            
            try:
                summary_completion = client.chat.completions.create(
                    messages=[{"role": "user", "content": summary_prompt}],
                    model="llama-3.3-70b-versatile",
                    temperature=0.3,
                    max_tokens=500
                )
                summary = summary_completion.choices[0].message.content
            except Exception as e:
                self.send_error_response(500, f"Error generating summary: {str(e)}")
                return
            
            # Generate project paper
            paper_prompt = (
                f"Write a one-page project overview for {data['owner']}/{data['repo']}.\n\n"
                f"Include these sections:\n"
                f"- Project Name and Purpose\n"
                f"- Main Features\n"
                f"- Technical Architecture\n"
                f"- Key Technologies\n"
                f"- How to Use\n"
                f"- Contribution Guidelines\n\n"
                f"Description: {data['description']}\n"
                f"{structure_text}\n"
                f"README: {data.get('readme', 'Not available')[:4000]}"
            )
            
            try:
                paper_completion = client.chat.completions.create(
                    messages=[{"role": "user", "content": paper_prompt}],
                    model="llama-3.3-70b-versatile",
                    temperature=0.3,
                    max_tokens=1500
                )
                project_paper = paper_completion.choices[0].message.content
            except Exception as e:
                project_paper = "Error generating detailed report: " + str(e)
            
            # Fetch repository tree
            tree_data = self._fetch_repo_tree(data['owner'], data['repo'])
            
            # Send successful response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._set_cors_headers()
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
    
    def _fetch_repo_tree(self, owner, repo):
        """Fetch repository tree from GitHub API"""
        try:
            headers = {"Accept": "application/vnd.github.v3+json"}
            github_token = os.environ.get("GITHUB_TOKEN")
            if github_token:
                headers["Authorization"] = f"token {github_token}"
            
            tree_response = requests.get(
                f"https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1",
                headers=headers,
                timeout=15
            )
            
            if not tree_response.ok:
                # Try master branch
                tree_response = requests.get(
                    f"https://api.github.com/repos/{owner}/{repo}/git/trees/master?recursive=1",
                    headers=headers,
                    timeout=15
                )
            
            if tree_response.ok:
                tree_json = tree_response.json()
                if not tree_json.get("truncated", False):
                    return self._build_tree_structure(repo, tree_json.get("tree", []))
                else:
                    return {
                        "name": repo,
                        "type": "directory",
                        "icon": "📁",
                        "children": [{"name": "Repository too large", "type": "file", "icon": "⚠️", "children": []}]
                    }
            else:
                return {
                    "name": repo,
                    "type": "directory",
                    "icon": "📁",
                    "children": [{"name": "Failed to fetch tree", "type": "file", "icon": "❌", "children": []}]
                }
        except Exception as e:
            return {
                "name": repo,
                "type": "directory",
                "icon": "📁",
                "children": [{"name": f"Error: {str(e)}", "type": "file", "icon": "⚠️", "children": []}]
            }
    
    def _build_tree_structure(self, repo_name, items):
        """Build hierarchical tree structure from flat GitHub tree"""
        tree_data = {
            "name": repo_name,
            "type": "directory",
            "icon": "📁",
            "children": []
        }
        
        dir_mapping = {"": tree_data}
        items.sort(key=lambda x: (x.get("type", "") != "tree", x.get("path", "")))
        
        for item in items:
            path = item.get("path", "")
            if any(skip in path.lower() for skip in [".git/", "node_modules/", "__pycache__/"]):
                continue
            
            parts = path.split("/")
            is_dir = item.get("type") == "tree"
            parent_path = "/".join(parts[:-1])
            
            if is_dir:
                dir_node = {
                    "name": parts[-1],
                    "type": "directory",
                    "icon": "📁",
                    "children": []
                }
                dir_mapping[path] = dir_node
                parent = dir_mapping.get(parent_path, tree_data)
                parent["children"].append(dir_node)
            else:
                file_node = {
                    "name": parts[-1],
                    "type": "file",
                    "icon": "📄",
                    "children": []
                }
                parent = dir_mapping.get(parent_path, tree_data)
                parent["children"].append(file_node)
        
        self._sort_tree(tree_data)
        return tree_data
    
    def _sort_tree(self, node):
        """Sort tree nodes recursively"""
        if node.get("children"):
            node["children"].sort(key=lambda x: (x.get("type") != "directory", x.get("name", "").lower()))
            for child in node["children"]:
                self._sort_tree(child)
    
    def send_error_response(self, status_code, message):
        """Send error response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        error_response = {"error": message, "status": status_code}
        self.wfile.write(json.dumps(error_response).encode())