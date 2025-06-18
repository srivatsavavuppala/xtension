# File: api/summarize.py

from http.server import BaseHTTPRequestHandler
import json
import os
from groq import Groq

class handler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        try:
            # Read the request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Initialize Groq client
            GROQ_API_KEY = os.environ.get("API_KEY")
            client = Groq(api_key=GROQ_API_KEY)
            
            # Extract repo info
            repo = data.get('repo', '')
            owner = data.get('owner', '')
            description = data.get('description', '')
            readme = data.get('readme', '')
            
            # Generate summary
            summary_prompt = (
                f"Summarize the following GitHub repository in a concise paragraph. "
                f"Focus only on the project's purpose, main features, and how it is organized. "
                f"Ignore any information about funding, badges, external links, or unrelated content.\n\n"
                f"Repository: {owner}/{repo}\n"
                f"Description: {description}\n"
                f"README: {readme[:2000]}"
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
                f"Repository: {owner}/{repo}\n"
                f"Description: {description}\n"
                f"README: {readme[:4000]}"
            )
            paper_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": paper_prompt}],
                model="llama-3.3-70b-versatile",
                stream=False,
            )
            project_paper = paper_completion.choices[0].message.content

            # Send response
            response = {
                "summary": summary,
                "project_paper": project_paper
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))