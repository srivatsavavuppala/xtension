from http.server import BaseHTTPRequestHandler
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from typing import List, Optional
import json
import os
import re
import time
import logging
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GitHub Repository Summarizer API",
    description="AI-powered GitHub repository analysis and summarization",
    version="1.4.0"
)

class FileInfo(BaseModel):
    path: str
    type: str
    size: Optional[int] = None
    
    @validator('path')
    def validate_path(cls, v):
        if not v or len(v) > 500:
            raise ValueError('Path must be between 1 and 500 characters')
        return v.strip()
    
    @validator('type')
    def validate_type(cls, v):
        valid_types = ['file', 'dir', 'tree', 'blob']
        if v not in valid_types:
            raise ValueError(f'Type must be one of: {valid_types}')
        return v

class RepoInfo(BaseModel):
    repo: str
    owner: str
    description: str = ""
    readme: str = ""
    structure: List[FileInfo] = []
    url: Optional[str] = None
    extractedAt: Optional[int] = None
    
    @validator('repo')
    def validate_repo(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('Repository name is required')
        
        # GitHub repository name validation
        if not re.match(r'^[a-zA-Z0-9._-]+$', v) or len(v) > 100:
            raise ValueError('Invalid repository name format')
        
        return v.strip()
    
    @validator('owner')
    def validate_owner(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('Owner name is required')
        
        # GitHub username validation
        if not re.match(r'^[a-zA-Z0-9._-]+$', v) or len(v) > 100:
            raise ValueError('Invalid owner name format')
        
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if v and len(v) > 1000:
            return v[:1000] + '...'
        return v.strip() if v else ""
    
    @validator('readme')
    def validate_readme(cls, v):
        if v and len(v) > 10000:
            return v[:10000] + '...'
        return v.strip() if v else ""

class SummaryResponse(BaseModel):
    summary: str
    project_paper: str
    processing_time: Optional[float] = None
    cached: Optional[bool] = False

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
        start_time = time.time()
        
        try:
            logger.info("Received POST request for repository summarization")
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 50000:  # 50KB limit
                self.send_error_response(413, "Request body too large")
                return
                
            post_data = self.rfile.read(content_length)
            
            # Parse and validate JSON data
            try:
                data = json.loads(post_data.decode('utf-8'))
                logger.info(f"Processing request for {data.get('owner', 'unknown')}/{data.get('repo', 'unknown')}")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in request: {e}")
                self.send_error_response(400, "Invalid JSON format")
                return
            
            # Validate using Pydantic model
            try:
                repo_info = RepoInfo(**data)
            except Exception as e:
                logger.error(f"Validation error: {e}")
                self.send_error_response(400, f"Validation error: {str(e)}")
                return
            
            # Initialize Groq client
            api_key = os.environ.get("API_KEY")
            if not api_key:
                logger.error("API_KEY environment variable not set")
                self.send_error_response(500, "API service not configured")
                return
            
            try:
                client = Groq(api_key=api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.send_error_response(500, "AI service initialization failed")
                return
            
            # Create a formatted file structure string
            structure_text = self.format_file_structure(repo_info.structure)
            
            # Generate summary with error handling
            try:
                summary = self.generate_summary(client, repo_info, structure_text)
                logger.info("Summary generated successfully")
            except Exception as e:
                logger.error(f"Failed to generate summary: {e}")
                self.send_error_response(500, "Failed to generate summary")
                return
            
            # Generate project paper with error handling
            try:
                project_paper = self.generate_project_paper(client, repo_info, structure_text)
                logger.info("Project paper generated successfully")
            except Exception as e:
                logger.error(f"Failed to generate project paper: {e}")
                self.send_error_response(500, "Failed to generate project paper")
                return
            
            # Calculate processing time
            processing_time = time.time() - start_time
            logger.info(f"Request processed successfully in {processing_time:.2f}s")
            
            # Send successful response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'public, max-age=3600')  # Cache for 1 hour
            self.end_headers()
            
            response = SummaryResponse(
                summary=summary,
                project_paper=project_paper,
                processing_time=processing_time,
                cached=False
            )
            
            self.wfile.write(response.json().encode())
            
        except Exception as e:
            logger.error(f"Unexpected error in POST handler: {e}")
            self.send_error_response(500, f"Internal server error: {str(e)}")
    
    def format_file_structure(self, structure: List[FileInfo]) -> str:
        """Format file structure for AI prompt"""
        if not structure:
            return "Repository Structure: Not available\n"
        
        structure_text = "Repository Structure:\n"
        for file_info in structure[:50]:  # Limit to 50 files to avoid token limits
            prefix = "📁 " if file_info.type in ["tree", "dir"] else "📄 "
            structure_text += f"{prefix}{file_info.path}\n"
        
        if len(structure) > 50:
            structure_text += f"... and {len(structure) - 50} more files\n"
        
        return structure_text
    
    def generate_summary(self, client, repo_info: RepoInfo, structure_text: str) -> str:
        """Generate repository summary using AI"""
        summary_prompt = (
            f"Summarize the following GitHub repository in a concise, informative paragraph. "
            f"Focus on the project's purpose, main features, and technical approach. "
            f"Be specific and avoid generic statements.\n\n"
            f"Repository: {repo_info.owner}/{repo_info.repo}\n"
            f"Description: {repo_info.description or 'No description provided'}\n\n"
            f"{structure_text}\n\n"
            f"README Content: {repo_info.readme[:3000] if repo_info.readme else 'No README available'}"
        )
        
        completion = client.chat.completions.create(
            messages=[{
                "role": "system", 
                "content": "You are a technical documentation expert. Provide clear, concise summaries of software projects."
            }, {
                "role": "user", 
                "content": summary_prompt
            }],
            model="llama-3.3-70b-versatile",
            max_tokens=500,
            temperature=0.3,
            stream=False,
        )
        
        return completion.choices[0].message.content.strip()
    
    def generate_project_paper(self, client, repo_info: RepoInfo, structure_text: str) -> str:
        """Generate detailed project paper using AI"""
        paper_prompt = (
            f"Write a comprehensive one-page technical overview for the GitHub repository {repo_info.owner}/{repo_info.repo}. "
            f"Structure your response with these sections:\n\n"
            f"# {repo_info.repo}\n\n"
            f"## Project Overview\n"
            f"## Key Features\n"
            f"## Technical Architecture\n"
            f"## Technologies Used\n"
            f"## Installation & Usage\n"
            f"## Contributing\n"
            f"## Additional Information\n\n"
            f"Repository Details:\n"
            f"- Owner: {repo_info.owner}\n"
            f"- Repository: {repo_info.repo}\n"
            f"- Description: {repo_info.description or 'No description provided'}\n\n"
            f"{structure_text}\n\n"
            f"README Content:\n{repo_info.readme[:5000] if repo_info.readme else 'No README available'}"
        )
        
        completion = client.chat.completions.create(
            messages=[{
                "role": "system", 
                "content": "You are a technical writer creating professional project documentation. Write clear, well-structured, and informative content."
            }, {
                "role": "user", 
                "content": paper_prompt
            }],
            model="llama-3.3-70b-versatile",
            max_tokens=2000,
            temperature=0.2,
            stream=False,
        )
        
        return completion.choices[0].message.content.strip()
    
    def send_error_response(self, status_code, message):
        """Send error response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_response = {"error": message}
        self.wfile.write(json.dumps(error_response).encode())