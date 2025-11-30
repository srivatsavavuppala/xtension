"""
Vercel serverless function wrapper for FastAPI backend (RAG API)

This creates a Vercel-compatible handler that wraps the FastAPI application.
Access endpoints at:
- /api/rag/ - root endpoint
- /api/rag/build_embeddings - build embeddings  
- /api/rag/query - query repository
- /api/rag/summarize - summarize repository
"""
import sys
import os
import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler
import asyncio

# Add src directory to Python path
current_dir = Path(__file__).parent
src_dir = current_dir.parent / 'src'
if src_dir.exists():
    sys.path.insert(0, str(src_dir))
else:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Import FastAPI app
from backend import app

class handler(BaseHTTPRequestHandler):
    """Vercel handler that wraps FastAPI app using ASGI interface"""
    
    def _set_cors_headers(self):
        """Set CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Max-Age', '86400')
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        asyncio.run(self._handle_async_request())
    
    def do_POST(self):
        """Handle POST requests"""
        asyncio.run(self._handle_async_request())
    
    def do_PUT(self):
        """Handle PUT requests"""
        asyncio.run(self._handle_async_request())
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        asyncio.run(self._handle_async_request())
    
    async def _handle_async_request(self):
        """Process request through FastAPI"""
        try:
            # Extract path - remove /api/rag prefix if present
            path = self.path.split('?')[0]  # Remove query string
            if path.startswith('/api/rag'):
                path = path[8:]  # Remove '/api/rag'
            if not path or path == '':
                path = '/'
            
            # Get query string
            query_string = b''
            if '?' in self.path:
                query_string = self.path.split('?', 1)[1].encode()
            
            # Read body
            content_length = int(self.headers.get('Content-Length', 0))
            body = b''
            if content_length > 0:
                body = self.rfile.read(content_length)
            
            # Build headers
            headers = []
            for key, value in self.headers.items():
                headers.append((key.lower().encode(), value.encode()))
            
            # Create ASGI scope
            scope = {
                'type': 'http',
                'method': self.command,
                'path': path,
                'raw_path': path.encode(),
                'query_string': query_string,
                'headers': headers,
                'client': None,
                'server': None,
                'scheme': 'https',
                'root_path': '',
            }
            
            # Create message queue
            messages = []
            
            async def receive():
                if not messages:
                    return {'type': 'http.request', 'body': body, 'more_body': False}
                return messages.pop(0)
            
            response_status = None
            response_headers = []
            response_body = b''
            
            async def send(message):
                nonlocal response_status, response_headers, response_body
                if message['type'] == 'http.response.start':
                    response_status = message['status']
                    response_headers = message['headers']
                elif message['type'] == 'http.response.body':
                    response_body += message.get('body', b'')
            
            # Call FastAPI app
            await app(scope, receive, send)
            
            # Send response
            if response_status:
                self.send_response(response_status)
            else:
                self.send_response(500)
            
            # Add CORS headers
            self._set_cors_headers()
            
            # Add response headers (skip CORS duplicates)
            header_dict = {}
            for key, value in response_headers:
                key_str = key.decode()
                value_str = value.decode()
                if key_str.lower() not in ['access-control-allow-origin', 'access-control-allow-methods']:
                    header_dict[key_str] = value_str
            
            for key, value in header_dict.items():
                self.send_header(key, value)
            
            self.send_header('Content-Length', str(len(response_body)))
            self.end_headers()
            self.wfile.write(response_body)
            
        except Exception as e:
            self.send_error_response(500, f"Error: {str(e)}")
    
    def send_error_response(self, status_code, message):
        """Send error response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        error_response = {"error": message, "status": status_code}
        self.wfile.write(json.dumps(error_response).encode())
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass
