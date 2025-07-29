# Development Guide

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Code Structure](#code-structure)
- [API Documentation](#api-documentation)
- [Build Process](#build-process)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🏗️ Architecture Overview

The GitHub Repository Summarizer uses a modular architecture with clear separation of concerns:

### Frontend (Chrome Extension)
- **Modular Design**: Split into focused modules (Theme, API, Storage, History, Utils)
- **Modern JavaScript**: ES2022+ features with proper error handling
- **Responsive UI**: CSS variables for theming with dark/light mode support
- **State Management**: Chrome storage API with data validation and cleanup

### Backend (Vercel Serverless)
- **FastAPI**: Modern Python web framework with automatic API documentation
- **Pydantic**: Data validation and serialization
- **Groq AI**: LLM integration for intelligent content generation
- **Structured Logging**: Comprehensive logging for debugging and monitoring

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ (for backend development)
- Chrome/Edge browser for testing

### Frontend Setup
```bash
# Install dependencies
npm install

# Run linting and formatting
npm run dev

# Validate manifest
npm run validate

# Build for production
npm run build
```

### Backend Setup (Optional - for local development)
```bash
cd api
pip install -r requirements.txt

# Set environment variables
export API_KEY="your_groq_api_key"

# Run locally
uvicorn index:app --reload
```

### Extension Installation
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory
4. The extension will appear in your toolbar

## 📁 Code Structure

```
xtension/
├── src/                          # Extension source code
│   ├── modules/                  # Modular JavaScript components
│   │   ├── theme.js             # Theme management
│   │   ├── api.js               # API communication with caching
│   │   ├── storage.js           # Chrome storage management
│   │   ├── history.js           # History overlay and UI
│   │   └── utils.js             # Utility functions
│   ├── popup.html               # Extension popup interface
│   ├── popup.js                 # Main application logic
│   ├── content.js               # GitHub page interaction
│   ├── background.js            # Service worker
│   └── styles.css               # UI styling
├── api/                         # Backend API
│   ├── index.py                 # FastAPI serverless function
│   └── requirements.txt         # Python dependencies
├── icons/                       # Extension icons
├── scripts/                     # Build and validation scripts
├── manifest.json               # Extension manifest
├── package.json                # Node.js configuration
└── README.md                   # User documentation
```

## 🔌 API Documentation

### Frontend Modules

#### ThemeManager
Handles dark/light theme switching with persistence.

```javascript
const themeManager = new ThemeManager();
themeManager.setTheme(true); // Enable dark mode
const isDark = themeManager.isDarkMode();
```

#### APIManager
Manages backend communication with caching and error handling.

```javascript
const apiManager = new APIManager();
const result = await apiManager.summarizeRepository(repoInfo, onProgress);
```

#### StorageManager
Handles Chrome storage operations with data validation.

```javascript
const storageManager = new StorageManager();
await storageManager.saveAnalyzedHistory(historyItem);
const favorites = await storageManager.getFavorites();
```

#### HistoryManager
Manages history overlay and repository tracking.

```javascript
const historyManager = new HistoryManager(storageManager, themeManager);
```

#### Utils
Common utility functions for the extension.

```javascript
Utils.debounce(func, 1000);
Utils.sanitizeHTML(userInput);
Utils.formatRelativeTime(timestamp);
```

### Backend API

#### POST /api/
Analyzes a GitHub repository and returns summary + detailed report.

**Request Body:**
```json
{
  "repo": "repository-name",
  "owner": "owner-username", 
  "description": "Repository description",
  "readme": "README content",
  "structure": [
    {
      "path": "src/main.js",
      "type": "file",
      "size": 1024
    }
  ]
}
```

**Response:**
```json
{
  "summary": "Concise repository summary",
  "project_paper": "Detailed technical overview",
  "processing_time": 2.34,
  "cached": false
}
```

## 🔨 Build Process

### Development Workflow
1. **Code Changes**: Make changes to source files
2. **Linting**: `npm run lint:fix` - Fix code style issues
3. **Formatting**: `npm run format` - Apply consistent formatting
4. **Validation**: `npm run validate` - Check manifest integrity
5. **Testing**: Manual testing in browser
6. **Build**: `npm run build` - Prepare for production

### Code Quality Tools
- **ESLint**: JavaScript linting with security rules
- **Prettier**: Code formatting for consistency
- **Manifest Validator**: Custom validation for Chrome extension manifest

### Security Measures
- **Content Security Policy**: Restricts script execution
- **Input Sanitization**: All user inputs are sanitized
- **Permission Minimization**: Only necessary permissions requested
- **HTTPS Only**: All external requests use HTTPS

## 🧪 Testing

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] GitHub page detection works correctly
- [ ] Repository information extraction is accurate
- [ ] API communication functions properly
- [ ] Dark/light theme switching works
- [ ] History and favorites functionality
- [ ] Download feature works
- [ ] Error handling displays appropriate messages

### Browser Testing
Test on multiple browsers and versions:
- Chrome 88+
- Edge 88+
- Different screen sizes and resolutions

### Error Scenarios
- Network connectivity issues
- Invalid GitHub pages
- API service unavailable
- Malformed repository data

## 🚀 Deployment

### Frontend (Chrome Web Store)
1. **Prepare Package**: Run `npm run build`
2. **Create ZIP**: Archive all extension files
3. **Submit**: Upload to Chrome Web Store Developer Dashboard
4. **Review**: Wait for Google's review process

### Backend (Vercel)
1. **Environment Variables**: Set `API_KEY` in Vercel dashboard
2. **Deploy**: Push to main branch (auto-deploy enabled)
3. **Monitor**: Check logs and performance metrics

### Version Management
- Update `manifest.json` version for extensions
- Update `package.json` version for consistency
- Tag releases in Git
- Update changelog

## 🤝 Contributing

### Code Style Guidelines
- Use ESLint and Prettier configurations
- Write descriptive commit messages
- Add JSDoc comments for functions
- Follow modular architecture patterns

### Pull Request Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following code style
4. Run tests: `npm run build`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push branch: `git push origin feature/amazing-feature`
7. Open Pull Request with detailed description

### Issue Reporting
When reporting issues, include:
- Browser version and OS
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

### Development Best Practices
- **Security First**: Always sanitize inputs and validate data
- **Performance**: Use caching and debouncing where appropriate
- **Accessibility**: Ensure UI is accessible to all users
- **Documentation**: Keep documentation updated with code changes
- **Error Handling**: Provide meaningful error messages to users

### Module Development Guidelines
When creating new modules:
1. Follow the existing module pattern
2. Export classes/functions to `window` object
3. Include comprehensive JSDoc documentation
4. Add proper error handling
5. Update main application to use new module

---

For questions or support, please open an issue on GitHub or contact the maintainers.