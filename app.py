"""Root entry point for Render deployment"""
import sys
import os

# Determine the correct path to backend.py
current_dir = os.path.dirname(os.path.abspath(__file__))
src_path = os.path.join(current_dir, 'src')

# Add src directory to path if it exists
if os.path.exists(src_path):
    sys.path.insert(0, src_path)
elif os.path.exists(os.path.join(current_dir, 'backend.py')):
    # If backend.py is in the same directory as app.py
    sys.path.insert(0, current_dir)
else:
    # Try parent directory
    parent_dir = os.path.dirname(current_dir)
    if os.path.exists(os.path.join(parent_dir, 'src', 'backend.py')):
        sys.path.insert(0, os.path.join(parent_dir, 'src'))

# Import the FastAPI app
from backend import app

# Export app for Render
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
