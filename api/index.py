from http.server import BaseHTTPRequestHandler
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
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
            
            # Send successful response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "summary": summary,
                "project_paper": project_paper
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