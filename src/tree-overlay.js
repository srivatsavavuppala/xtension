// Function to build tree HTML structure
function buildTreeHtml(node) {
    if (!node) return '';
    
    let html = '<ul class="repo-tree">';
    
    function renderNode(node) {
        const isDirectory = node.type === 'directory';
        const icon = node.icon || (isDirectory ? '📁' : '📄');
        
        let nodeHtml = `
            <li>
                <span class="${isDirectory ? 'directory' : 'file'}">
                    ${icon} ${node.name}
                </span>
        `;
        
        if (node.children && node.children.length > 0) {
            nodeHtml += '<ul class="subtree">';
            node.children.forEach(child => {
                nodeHtml += renderNode(child);
            });
            nodeHtml += '</ul>';
        }
        
        nodeHtml += '</li>';
        return nodeHtml;
    }
    
    html += renderNode(node);
    html += '</ul>';
    return html;
}

// Function to show repository tree
async function showRepoTree(owner, repo) {
    try {
        const overlay = document.createElement('div');
        overlay.id = 'repo-tree-overlay';
        overlay.classList.add('repo-tree-overlay');
        
        // Add loading indicator
        overlay.innerHTML = '<div class="loading">Loading repository structure...</div>';
        document.body.appendChild(overlay);
        
        // Fetch repository structure
        const response = await fetch(`https://xtension-alpha.vercel.app/api/tree/${owner}/${repo}`);
        const data = await response.json();
        
        if (data.error) {
            overlay.innerHTML = `<div class="error">❌ ${data.error}</div>`;
            return;
        }
        
        // Build and display the tree
        overlay.innerHTML = buildTreeHtml(data.tree);
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('close-btn');
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = () => {
            document.body.removeChild(overlay);
        };
        overlay.appendChild(closeBtn);
        
        // Close on click outside
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
    } catch (error) {
        console.error('Error showing repository tree:', error);
    }
}

// Add CSS
const style = document.createElement('style');
style.textContent = `
.repo-tree-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    padding: 20px;
    box-sizing: border-box;
    overflow: auto;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.repo-tree {
    list-style: none;
    padding: 0;
    margin: 0;
    background: #1e1e1e;
    border-radius: 8px;
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.subtree {
    list-style: none;
    padding-left: 20px;
    margin: 5px 0;
}

.directory, .file {
    display: block;
    padding: 5px 10px;
    border-radius: 4px;
    margin: 2px 0;
    cursor: default;
    transition: background-color 0.2s;
}

.directory:hover, .file:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.close-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    padding: 10px;
    transition: transform 0.2s;
}

.close-btn:hover {
    transform: scale(1.1);
}

.loading, .error {
    text-align: center;
    padding: 20px;
    font-size: 16px;
    background: #1e1e1e;
    border-radius: 8px;
    max-width: 800px;
    margin: 0 auto;
}

.error {
    color: #ff6b6b;
}
`;
document.head.appendChild(style);
