# Repo Summarizer Extension 🌳

A powerful browser extension that provides AI-powered analysis and visualization of GitHub repositories, including a beautiful tree structure display.

## ✨ Features

### 🔍 **Repository Analysis**
- **AI-Powered Summaries**: Get intelligent summaries of any GitHub repository
- **Tree Visualization**: Beautiful, interactive tree structure showing file/folder organization
- **Project Reports**: Download detailed project analysis reports
- **Smart Extraction**: Automatically extracts repository structure and metadata

### 🌳 **Tree Visualization**
- **Hierarchical Display**: Clear tree structure with proper indentation and connectors
- **File Type Icons**: Visual indicators for files (📄) and directories (📁)
- **Interactive Elements**: Hover effects and smooth animations
- **Responsive Design**: Works perfectly on all screen sizes
- **Dark/Light Theme**: Automatic theme switching with beautiful gradients

### 📊 **History & Management**
- **Analysis History**: Track all analyzed repositories
- **Favorites System**: Star and organize your favorite repositories
- **Visit Tracking**: Monitor repository browsing patterns
- **Quick Access**: One-click access to previous analyses

## 🚀 Installation

### For Users
1. Download the extension files
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. Pin the extension to your toolbar

### For Developers
1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   cd src
   python backend.py
   ```
4. Load the extension in your browser

## 🎯 Usage

### Basic Analysis
1. Navigate to any GitHub repository page
2. Click the Repo Summarizer extension icon
3. Click "Analyze Repository"
4. Wait for the AI analysis to complete
5. View the beautiful tree visualization and summary

### Tree Visualization
- **Repository Tree View**: Click the tree icon to open an elegant modal displaying the complete repository structure
- **Expandable/Collapsible**: Folders can be expanded or collapsed to manage complex repository structures
- **Material Design Icons**: Modern, intuitive icons for files and folders
- **Interactive Elements**: 
  - Enhanced hover states with optimized contrast
  - Clear visual hierarchy with proper indentation
  - Smooth animations for expanding/collapsing folders
- **Theme-Aware**: Fully supports both light and dark modes with proper contrast
- **Modal Interface**: 
  - Clean, organized display of repository structure
  - Easy-to-read headers with theme-aware styling
  - Quick close with escape key or click outside
- **Download Report**: Get a comprehensive project report with tree structure

### History Management
- **View History**: Click the history icon to see all analyzed repositories
- **Favorites**: Star repositories for quick access
- **Quick Actions**: Download reports or view trees from history

## 🏗️ Architecture

### Frontend (Extension)
- **popup.js**: Main extension logic and UI management
- **content.js**: GitHub page content extraction
- **styles.css**: Beautiful, responsive styling with animations
- **popup.html**: Extension popup interface

### Backend (Python Flask)
- **backend.py**: Flask server with tree extraction and analysis
- **Tree Extraction**: BeautifulSoup-based HTML parsing
- **Structure Analysis**: Intelligent repository organization detection
- **Report Generation**: Comprehensive project documentation

### Key Components
- **Tree Extractor**: Automatically detects file/folder structure
- **Visualization Engine**: Creates beautiful tree diagrams
- **Theme System**: Automatic light/dark theme switching
- **Responsive Design**: Mobile-friendly interface

## 🎨 UI Features

### Tree Visualization
- **Monospace Font**: Professional code-like appearance
- **Connector Lines**: Clear hierarchical relationships
- **Color Coding**: Different colors for files vs directories
- **Hover Effects**: Enhanced visibility with optimized contrast
- **Material Icons**: Modern file and folder icons for better visual hierarchy
- **Interactive Elements**: Smooth hover states and transitions

### Theme System
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Optimized contrast and readability
- **Automatic Switching**: Detects system theme preference
- **Smooth Transitions**: Beautiful theme change animations
- **Consistent Styling**: Unified dark mode experience across all components

### History Display
- **Visit Counter**: Shows number of times a repository was visited
- **Enhanced Link Icons**: Larger, more visible link indicators
- **Optimized Spacing**: Better visual hierarchy with proper gaps
- **Dark Mode Support**: High contrast text and icons in dark theme
- **Repository Structure**: Clean header styling with theme-aware backgrounds

### Responsive Design
- **Mobile Optimized**: Works perfectly on small screens
- **Grid Layout**: Adaptive content organization
- **Touch Friendly**: Optimized for touch devices
- **Flexible Sizing**: Adapts to different popup dimensions

## 🔧 Technical Details

### Tree Extraction
- **HTML Parsing**: BeautifulSoup-based content analysis
- **Selector Fallbacks**: Multiple extraction strategies for reliability
- **Error Handling**: Graceful fallbacks for edge cases
- **Performance**: Optimized for large repositories

### Data Flow
1. **Content Script**: Extracts repository HTML and structure
2. **Extension**: Sends data to backend for processing
3. **Backend**: Analyzes structure and generates summary
4. **Frontend**: Displays beautiful tree visualization

### Storage
- **Chrome Storage**: Local data persistence
- **History Management**: Efficient data organization
- **Cache System**: Quick access to recent analyses

## 🌟 Advanced Features

### Tree Navigation
- **Expandable Nodes**: Click to expand/collapse directories
- **Path Display**: Shows full file paths
- **Type Indicators**: Clear file type identification
- **Size Information**: File and directory statistics

### Export Options
- **Text Reports**: Downloadable project analysis
- **Tree Data**: Export repository structure
- **Summary Data**: AI-generated insights
- **Metadata**: Repository information and statistics

## 🐛 Troubleshooting

### Common Issues
- **Tree Not Loading**: Ensure you're on a GitHub repository page
- **Analysis Failed**: Check internet connection and try again
- **Extension Not Working**: Reload the extension and refresh the page

### Performance Tips
- **Large Repositories**: Analysis may take up to 30 seconds
- **Memory Usage**: Extension automatically limits tree size
- **Cache Management**: Clear history if experiencing slowdowns

## 🤝 Contributing

### Development Setup
1. Fork the repository  
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- **JavaScript**: ES6+ with modern syntax
- **Python**: PEP 8 compliant
- **CSS**: BEM methodology with CSS custom properties
- **HTML**: Semantic markup with accessibility

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **GitHub**: For providing the repository data
- **BeautifulSoup**: For HTML parsing capabilities
- **Chrome Extensions API**: For browser integration
- **Open Source Community**: For inspiration and support

---

**Repo Summarizer** - Making GitHub repositories more accessible and understandable through beautiful visualizations and AI-powered insights! 🌳✨

## RAG-Powered Code Navigation Assistant (Planned Enhancement)

Enhance the extension with a Retrieval-Augmented Generation (RAG) assistant that lets users ask natural-language questions about a repository and receive precise answers with citations to file paths and line ranges.

### What you get
- **Ask Repo panel** in the extension: pose questions and get answers grounded in the codebase.
- **Citations**: Each answer includes clickable references like `path/to/file.py:L120-L168`.
- **Fast queries**: Embeddings are built and stored during the initial analysis so queries are quick.

### Overview of the design
- **Two-stage retrieval**:
  - Stage 1: Semantic search over file-level embeddings to identify the most relevant files.
  - Stage 2: Retrieve and rank code/document chunks (≈300–500 tokens) from those files.
- **Vector database**: Use Chroma DB for persistence. Store embeddings + metadata: `repo_id`, `file_path`, `start_line`, `end_line`, `language`, `sha`.
- **Embeddings**: Use a hosted model (e.g., OpenAI `text-embedding-3-large`) or a local model (e.g., `sentence-transformers/all-MiniLM-L6-v2`).
- **LLM generation**: Retrieved chunks are sent as context to the LLM to generate concise, citation-rich answers.

### Backend changes
- **New endpoint**: `POST /query`
  - Accepts a natural-language `question` and repo identity.
  - Runs two-stage retrieval and returns an answer with citations and metadata.
- **Indexing at analysis time**:
  - During the initial repository analysis, fetch the default branch, list files, fetch raw contents for selected text files, and build both file-level and chunk-level embeddings.
  - Persist embeddings and metadata in Chroma so subsequent `/query` calls are fast.

#### /query API (spec)
Request:

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "question": "How does user authentication flow work?",
  "repo_id": "octocat/hello-world", 
  "max_files": 8, 
  "max_chunks": 12, 
  "max_context_tokens": 3000,
  "include_snippets": true
}
```

Response:

```json
{
  "answer": "Authentication uses OAuth2 flow ... See app/auth.py L45-L112 and routes/session.py L10-L44.",
  "citations": [
    {
      "file_path": "app/auth.py",
      "start_line": 45,
      "end_line": 112,
      "score": 0.82,
      "preview": "def login(): ..."
    },
    {
      "file_path": "routes/session.py",
      "start_line": 10,
      "end_line": 44,
      "score": 0.77
    }
  ],
  "debug": {
    "top_files": ["app/auth.py", "routes/session.py"],
    "top_chunks": 12
  }
}
```

### Retrieval pipeline
- **File selection**: Include text/code files (md, txt, rst, py, js/ts/tsx, json, yml/yaml, toml, go, rs, java, kt, swift, c/cpp/h, cs, php, rb). Exclude binaries, `node_modules`, `vendor`, `.git`, `dist`, `build`, `__pycache__`.
- **Limits**: Per-file raw size cap ~64 KB; total fetch cap ~1–2 MB to keep indexing snappy.
- **Chunking**: Split files into ~300–500 token chunks (with small overlap). Track `start_line`/`end_line` for each chunk.
- **Stage 1 (files)**: Embed the question, run vector search over file-level embeddings to get top-k files.
- **Stage 2 (chunks)**: For each top file, search its chunk embeddings and collect the top chunks until the context token budget is reached.
- **Prompting**: Prepend a “Context” block with chunk excerpts and file path citations. Instruct the model to answer only from the provided context or say “Not in context”.

### Vector DB (Chroma) setup
- **Persistence**: Use a dedicated directory for Chroma (e.g., `./.chroma`).
- **Collections**:
  - `repo_files`: one embedding per file; metadata `{repo_id, file_path, language, sha}`
  - `repo_chunks`: one embedding per chunk; metadata `{repo_id, file_path, start_line, end_line, token_count, sha}`
- **Repo identity**: `repo_id = "{owner}/{repo}"` to isolate indexes per repository.

### Embedding models
- **Hosted**: OpenAI `text-embedding-3-large` (high quality). Requires `OPENAI_API_KEY`.
- **Local**: `sentence-transformers/all-MiniLM-L6-v2` (fast, CPU-friendly). Requires `sentence-transformers` and `torch`.

### LLM for answering
- Default: Groq `llama-3.3-70b-versatile` (already used). Provide a concise answer with inline citations like `path/to/file.py:L10-L44`.

### Frontend changes (Ask Repo panel)
- Add a new panel in the extension UI (e.g., "Ask Repo"):
  - Input box for the question.
  - Submit button to call the backend `/query` endpoint with `{owner, repo, question}`.
  - Render the `answer` and a list of `citations` as clickable links to GitHub lines: `https://github.com/{owner}/{repo}/blob/{branch}/{file_path}#L{start}-L{end}`.
- Reuse the existing repository extraction logic in `src/content.js` to obtain `{owner, repo}`.

### Environment variables
- **Required**:
  - `API_KEY`: Groq API key for LLM calls (existing).
- **Optional**:
  - `OPENAI_API_KEY`: for OpenAI embeddings (if selected).
  - `EMBEDDING_MODEL`: `text-embedding-3-large` or `sentence-transformers/all-MiniLM-L6-v2`.
  - `CHROMA_PERSIST_DIR`: path to persist Chroma DB (default `./.chroma`).
  - `MAX_CONTEXT_TOKENS`: budget for prompt context (e.g., `3000`).

### Dependencies to add
- Python: `chromadb`, `sentence-transformers` (if using local embeddings), `tiktoken` (or similar) for token counts.

Install example:

```bash
pip install chromadb sentence-transformers tiktoken
```

### Implementation steps (high level)
1. **Indexing**: During repo analysis, detect default branch, list files, fetch raw content (respecting size/filters), build file- and chunk-level embeddings, and persist to Chroma with metadata.
2. **Query endpoint**: Implement `POST /query` that:
   - Embeds the question, runs Stage 1 (files) and Stage 2 (chunks).
   - Builds a grounded prompt with chunk excerpts and citations.
   - Calls the LLM and returns `answer`, `citations`, and optional `debug` info.
3. **Frontend**: Add the "Ask Repo" UI, call `/query`, and render the answer with clickable citations.
4. **Performance**: Cache repo content by commit SHA, cap total fetched bytes, and handle GitHub rate limits gracefully.
5. **Safety**: Ignore secrets files and binaries, and instruct the model to avoid speculation outside provided context.

### Notes
- Implement backend changes in your deployed API (e.g., `api/index.py`). The local FastAPI in `src/backend.py` can proxy `/query` similarly to `/summarize`.
- Index building time depends on repo size. For large repos, show progress and allow partial indexes.

