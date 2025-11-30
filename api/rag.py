import os
import sys
import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler
import asyncio

sys.path.append(os.path.dirname(__file__) + "/..")
from backend import app

from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import JSONResponse


@app.get("/docs")
async def swagger():
    return get_swagger_ui_html(
        openapi_url="/api/rag/openapi.json",
        title="Repo RAG API"
    )


@app.get("/openapi.json")
async def openapi():
    return JSONResponse(app.openapi())


@app.get("/health")
def health():
    return {"status": "ok", "service": "RAG API Running", "path": "/api/rag/", "success": True}


class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        asyncio.run(self.process())

    def do_POST(self):
        asyncio.run(self.process())

    def do_PUT(self):
        asyncio.run(self.process())

    def do_DELETE(self):
        asyncio.run(self.process())

    async def process(self):
        try:
            path = self.path.split("?")[0]
            if path.startswith("/api/rag"):
                path = path.replace("/api/rag", "", 1)
            if path == "":
                path = "/"

            query = b""
            if "?" in self.path:
                query = self.path.split("?", 1)[1].encode()

            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length) if length > 0 else b""

            headers = [(k.lower().encode(), v.encode()) for k, v in self.headers.items()]

            scope = {
                "type": "http",
                "method": self.command,
                "path": path,
                "raw_path": path.encode(),
                "query_string": query,
                "headers": headers,
                "client": None,
                "server": None,
                "scheme": "https",
            }

            buffer = {"status": 500, "headers": [], "body": b""}

            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}

            async def send(msg):
                if msg["type"] == "http.response.start":
                    buffer["status"] = msg["status"]
                    buffer["headers"] = msg.get("headers", [])
                elif msg["type"] == "http.response.body":
                    buffer["body"] += msg.get("body", b"")

            await app(scope, receive, send)

            self.send_response(buffer["status"])
            self._cors()

            for k, v in buffer["headers"]:
                self.send_header(k.decode(), v.decode())

            self.send_header("Content-Length", str(len(buffer["body"])))
            self.end_headers()
            self.wfile.write(buffer["body"])

        except Exception as e:
            self.send_response(500)
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, *_):
        return