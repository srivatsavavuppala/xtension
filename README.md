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
- **Main View**: Shows both tree structure and AI summary side by side
- **Tree-Only View**: Click "View Tree Only" for a focused tree display
- **Interactive Elements**: Hover over tree nodes for enhanced visibility
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
- **Hover Effects**: Interactive feedback on tree nodes

### Theme System
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Modern, eye-friendly interface
- **Automatic Switching**: Detects system theme preference
- **Smooth Transitions**: Beautiful theme change animations

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
