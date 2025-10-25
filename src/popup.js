(function addThemeVars() {
  const style = document.createElement('style');
  style.textContent = `
    /* Ask Panel Styles */
    #ask-repo {
      padding: 16px;
      margin-top: 12px;
      background: var(--modal-bg);
      border-radius: 8px;
      border: 1px solid var(--modal-border);
    }
    
    #askInput {
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--modal-border);
      background: var(--popup-bg);
      color: var(--popup-text);
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    #askBtn {
      background: var(--tab-active-color) !important;
      color: white !important;
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    #askBtn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    #askResult {
      margin-top: 16px;
      max-height: 300px;
      overflow-y: auto;
      padding-right: 8px;
    }
    
    .answer-container {
      background: var(--summary-bg);
      color: var(--summary-text);
      padding: 16px;
      border-radius: 8px;
      border: 1px solid var(--modal-border);
      font-size: 14px;
      line-height: 1.6;
      margin: 12px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .answer-container a {
      color: #58a6ff;
      text-decoration: none;
    }
    
    .answer-container a:hover {
      text-decoration: underline;
    }
    
    .references-list {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid var(--modal-border);
    }
    
    .references-list a {
      display: block;
      padding: 4px 0;
      color: #58a6ff;
      text-decoration: none;
      font-size: 12px;
    }
    
    .references-list a:hover {
      text-decoration: underline;
    }
    
    :root {
      --popup-bg: #fff;
      --popup-text: #23272e;
      --modal-bg: #fff;
      --modal-text: #23272e;
      --modal-border: #e2e8f0;
      --modal-title: #374151;
      --modal-close: #64748b;
      --modal-hover: #f1f5f9;
      --history-item-bg: #fff;
      --history-item-border: #e2e8f0;
      --history-item-text: #23272e;
      --summary-text: #23272e;
      --summary-bg: #f1f5f9;
      --empty-title: #374151;
      --empty-desc: #64748b;
      --tab-active-bg: #fff;
      --tab-active-color: #667eea;
      --tab-inactive-bg: transparent;
      --tab-inactive-color: #64748b;
    }
    body.dark-theme {
      --popup-bg: #18181b;
      --popup-text: #f1f5f9;
      --modal-bg: #23232a;
      --modal-text: #f1f5f9;
      --modal-border: #27272a;
      --modal-title: #f1f5f9;
      --modal-close: #a3a3a3;
      --modal-hover: #23232a;
      --history-item-bg: #23232a;
      --history-item-border: #27272a;
      --history-item-text: #f1f5f9;
      --summary-text: #f1f5f9;
      --summary-bg: #23232a;
      --empty-title: #f1f5f9;
      --empty-desc: #a3a3a3;
      --tab-active-bg: #23232a;
      --tab-active-color: #a3e635;
      --tab-inactive-bg: transparent;
      --tab-inactive-color: #a3a3a3;
    }

    /* Global overlay styles */
    .overlay-open {
      overflow: hidden;
    }
    
    .overlay-open #theme-toggle,
    .overlay-open #history-icon,
    .chat-overlay-open #theme-toggle {
      display: none !important;
      visibility: hidden !important;
    }

    /* Tree overlay specific styles */
    .tree-modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.7) !important;
      backdrop-filter: blur(5px) !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px !important;
      box-sizing: border-box !important;
    }

    .tree-modal {
      background: var(--modal-bg) !important;
      color: var(--modal-text) !important;
      border: 1px solid var(--modal-border) !important;
      border-radius: 12px !important;
      width: 90% !important;
      max-width: 700px !important;
      max-height: 85vh !important;
      position: relative !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    .tree-modal-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 20px 24px 16px 24px !important;
      border-bottom: 1px solid var(--modal-border) !important;
      flex-shrink: 0 !important;
    }

    .tree-modal-title {
      margin: 0 !important;
      color: var(--modal-title) !important;
      font-size: 18px !important;
      font-weight: 600 !important;
    }

    .tree-modal-close {
      background: none !important;
      border: none !important;
      color: var(--modal-close) !important;
      font-size: 20px !important;
      cursor: pointer !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      transition: all 0.2s !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      min-width: 36px !important;
      min-height: 36px !important;
    }

    .tree-modal-close:hover {
      background: var(--modal-hover) !important;
      color: var(--modal-text) !important;
    }

    .tree-modal-content {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 20px 24px !important;
      min-height: 0 !important;
    }

    .repo-tree {
      list-style: none !important;
      padding: 0 !important;
      margin: 0 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    
    .repo-tree li {
      background: var(--history-item-bg) !important;
      margin: 8px 0 !important;
      border-radius: 8px !important;
      padding: 10px 12px !important;
      border: 1px solid var(--history-item-border) !important;
      transition: all 0.2s ease !important;
      color: var(--history-item-text) !important;
    }
    
    .repo-tree li:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    }

    .subtree {
      list-style: none !important;
      padding-left: 20px !important;
      margin: 8px 0 !important;
    }

    .directory, .file {
      display: block !important;
      padding: 6px 10px !important;
      border-radius: 6px !important;
      margin: 2px 0 !important;
      cursor: default !important;
      transition: background-color 0.2s !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
    }

    .directory:hover, .file:hover {
      background-color: var(--modal-hover) !important;
    }

    .tree-loading, .tree-error {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 60px 20px !important;
      font-size: 14px !important;
      text-align: center !important;
      color: var(--modal-text) !important;
    }

    .tree-error {
      color: #ef4444 !important;
    }
  `;
  document.head.appendChild(style);
})();

function showInteractiveButtons() {
  const downloadBtn = document.getElementById('downloadBtn');
  const chatIcon = document.getElementById('chat-icon');
  if (downloadBtn) {
    downloadBtn.style.display = 'block';
  }
  if (chatIcon) {
    chatIcon.style.display = 'block';
  }
}

function hideInteractiveButtons() {
  const downloadBtn = document.getElementById('downloadBtn');
  const chatIcon = document.getElementById('chat-icon');
  if (downloadBtn) downloadBtn.style.display = 'none'; 
  if (chatIcon) chatIcon.style.display = 'none';
}

function closeChatOverlay() {
  if (chatOverlay && chatOverlay.parentElement) {
    document.body.classList.remove('chat-overlay-open');
    chatOverlay.parentElement.removeChild(chatOverlay);
    chatOverlay = null;
    // Save state that chat is closed
    chrome.storage.local.set({ chatOverlayOpen: false });
  }
}

const themeStyle = document.createElement('style');
themeStyle.textContent = `
body {
  background: var(--popup-bg) !important;
  color: var(--popup-text) !important;
}
.history-modal, .analyzed-btn-row, .favorite-btn, .remove-fav-btn {
  background: var(--modal-bg) !important;
  color: var(--modal-text) !important;
  border-color: var(--modal-border) !important;
}
.status-indicator.success { color: #059669; }
.status-indicator.error { color: #dc2626; }
.status-indicator.loading { color: #f59e42; }
.status-indicator.info { color: #2563eb; }
button, .tab-btn, .favorite-btn {
  background: #f1f5f9 !important;
  color: #23272e !important;
  border-color: #e2e8f0 !important;
}
input, textarea {
  background: #fff !important;
  color: #23272e !important;
  border-color: #e2e8f0 !important;
}
.history-modal {
  box-shadow: 0 8px 40px rgba(0,0,0,0.12) !important;
}
.analyzed-btn-row button {
  background: #10b981 !important;
  color: #fff !important;
}
.favorite-btn {
  background: #fffbe7 !important;
  color: #f59e0b !important;
}
.remove-fav-btn {
  color: #ef4444 !important;
}
.tab-btn[aria-selected="true"] {
  background: #e0e7ff !important;
  color: #3730a3 !important;
}
#summary {
  background: var(--summary-bg) !important;
  color: var(--summary-text) !important;
  border-color: #e2e8f0 !important;
}

body.dark-theme, body.dark-theme #popup {
  background: var(--popup-bg) !important;
  color: var(--popup-text) !important;
}

body.dark-theme #main {
  background: rgba(35, 35, 42, 0.95) !important;
  color: #f1f5f9 !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

body.dark-theme h2 {
  background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

body.dark-theme .subtitle {
  color: #a3a3a3 !important;
}

body.dark-theme button {
  background: linear-gradient(135deg, #334155 0%, #1e293b 100%) !important;
  color: #f1f5f9 !important;
}

body.dark-theme #theme-toggle,
body.dark-theme #history-icon {
  background: transparent !important;
  border: none !important;
  color: #f1f5f9 !important;
  box-shadow: none !important;
}

    body.dark-theme #theme-toggle:hover,
    body.dark-theme #history-icon:hover,
    body.dark-theme #chat-icon:hover {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    .floating-icon {
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 48px !important;
      height: 48px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      background: var(--tab-active-color) !important;
      border: 2px solid rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      backdrop-filter: blur(4px) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      z-index: 1000 !important;
      opacity: 0.9 !important;
    }

    .floating-icon:hover {
      transform: translateY(-4px) !important;
      opacity: 1 !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25) !important;
    }

    .floating-icon .material-icons {
      font-size: 24px !important;
    }

    .floating-icon img {
      width: 32px !important;
      height: 32px !important;
      filter: brightness(1.2) !important;
      transition: transform 0.3s ease !important;
    }

    .floating-icon:hover img {
      transform: scale(1.1) !important;
    }

    .chat-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: var(--popup-bg) !important;
      z-index: 1000 !important;
      display: flex !important;
      flex-direction: column !important;
    }

    .chat-header {
      padding: 16px !important;
      border-bottom: 1px solid var(--modal-border) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      position: relative !important;
    }

    .chat-header .material-icons {
      font-size: 20px !important;
    }
    
    .chat-header-title {
      flex: 1 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      margin-left: 8px !important;
    }

    .chat-body {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 16px !important;
    }

    .chat-input-container {
      padding: 16px !important;
      border-top: 1px solid var(--modal-border) !important;
      display: flex !important;
      gap: 8px !important;
      background: var(--popup-bg) !important;
    }

    .chat-input {
      flex: 1 !important;
      padding: 12px !important;
      border-radius: 20px !important;
      border: 1px solid var(--modal-border) !important;
      background: var(--summary-bg) !important;
      color: var(--popup-text) !important;
      outline: none !important;
    }

    .chat-send-btn {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: var(--tab-active-color) !important;
      color: white !important;
      border: none !important;
      cursor: pointer !important;
      transition: transform 0.2s ease !important;
      margin-left: 8px !important;
    }

    .chat-send-btn:hover {
      transform: scale(1.05) !important;
    }

    .chat-back-btn {
      position: absolute !important;
      top: 16px !important;
      right: 16px !important;
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: transparent !important;
      border: none !important;
      color: var(--popup-text) !important;
      cursor: pointer !important;
      transition: transform 0.2s ease !important;
    }

    .chat-back-btn:hover {
      transform: scale(1.1) !important;
      background: rgba(0, 0, 0, 0.05) !important;
    }

    .message {
      margin: 8px 0 !important;
      max-width: 80% !important;
      padding: 12px 16px !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
    }

    .message.user {
      background: var(--tab-active-color) !important;
      color: white !important;
      margin-left: auto !important;
      border-bottom-right-radius: 4px !important;
    }

    .message.bot {
      background: var(--summary-bg) !important;
      color: var(--popup-text) !important;
      margin-right: auto !important;
      border-bottom-left-radius: 4px !important;
    }/* Light theme icon styling */
body:not(.dark-theme) #theme-toggle,
body:not(.dark-theme) #history-icon {
  background: transparent !important;
  border: none !important;
  color: #374151 !important;
  box-shadow: none !important;
}

body:not(.dark-theme) #theme-toggle:hover,
body:not(.dark-theme) #history-icon:hover {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

body.dark-theme .history-modal, body.dark-theme .analyzed-btn-row, body.dark-theme .favorite-btn, body.dark-theme .remove-fav-btn {
  background: var(--modal-bg) !important;
  color: var(--modal-text) !important;
  border-color: var(--modal-border) !important;
}
body.dark-theme .status-indicator.success { color: #22d3ee; }
body.dark-theme .status-indicator.error { color: #f87171; }
body.dark-theme .status-indicator.loading { color: #fbbf24; }
body.dark-theme .status-indicator.info { color: #a3e635; }
body.dark-theme button, body.dark-theme .tab-btn, body.dark-theme .favorite-btn {
  background: #23232a !important;
  color: #f1f5f9 !important;
  border-color: #27272a !important;
}
body.dark-theme input, body.dark-theme textarea {
  background: #23232a !important;
  color: #f1f5f9 !important;
  border-color: #27272a !important;
}
body.dark-theme .history-modal {
  box-shadow: 0 8px 40px rgba(0,0,0,0.45) !important;
}
body.dark-theme .analyzed-btn-row button {
  background: #334155 !important;
  color: #f1f5f9 !important;
}
body.dark-theme .favorite-btn {
  background: #23232a !important;
  color: #fbbf24 !important;
}
body.dark-theme .remove-fav-btn {
  color: #f87171 !important;
}
body.dark-theme .tab-btn[aria-selected="true"] {
  background: #18181b !important;
  color: #a3e635 !important;
}
body.dark-theme #summary {
  background: #23232a !important;
  color: #f1f5f9 !important;
  border-color: #27272a !important;
}
`;
document.head.appendChild(themeStyle);

document.addEventListener('DOMContentLoaded', function() {
  // Chat functionality
  const downloadBtn = document.getElementById('downloadBtn');
  const chatIcon = document.getElementById('chat-icon');
  const clearSessionBtn = document.getElementById('clearSessionBtn');
  let chatOverlay = null;
  
  // Ensure chat icon exists before adding event listener
  if (chatIcon) {
    chatIcon.addEventListener('click', () => {
      if (!chatOverlay) {
        createChatOverlay();
      }
    });
  }

  // Function to show interactive buttons after analysis
  function showInteractiveButtons() {
    if (downloadBtn) {
      downloadBtn.style.display = 'block';
    }
    if (chatIcon) {
      chatIcon.style.display = 'block';
    }
  }
  function hideInteractiveButtons() {
  if (downloadBtn) downloadBtn.style.display = 'none'; 
  if (chatIcon) chatIcon.style.display = 'none';
}
hideInteractiveButtons();

  function closeChatOverlay() {
    if (chatOverlay && chatOverlay.parentElement) {
      document.body.classList.remove('chat-overlay-open');
      chatOverlay.parentElement.removeChild(chatOverlay);
      chatOverlay = null;
    }
  }

  function createChatOverlay() {
  if (chatOverlay) return; // Prevent multiple overlays
  
  // Save state that chat is open
  chrome.storage.local.set({ chatOverlayOpen: true });
  
  document.body.classList.add('chat-overlay-open');
  chatOverlay = document.createElement('div');
  chatOverlay.className = 'chat-overlay';
  chatOverlay.innerHTML = `
    <div class="chat-header">
      <span class="chat-header-title">Chat with Repository</span>
      <button class="chat-back-btn" id="close-chat-btn">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="chat-body" id="chat-messages"></div>
    <div class="chat-input-container">
      <input type="text" class="chat-input" id="chat-input" placeholder="Ask about this repository...">
      <button class="chat-send-btn" id="chat-send">
        <span class="material-icons">send</span>
      </button>
    </div>
  `;
  document.body.appendChild(chatOverlay);

    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    function addMessage(text, isUser) {
      const message = document.createElement('div');
      message.className = `message ${isUser ? 'user' : 'bot'}`;
      message.textContent = text;
      chatMessages.appendChild(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleQuestion(question) {
      addMessage(question, true);
      
      // Get current tab URL and extract repo info
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentUrl = tabs[0].url;
        if (!currentUrl.includes('github.com')) {
          addMessage('Please navigate to a GitHub repository to use this feature.', false);
          return;
        }
        
        // Extract repo info from GitHub URL
        chrome.tabs.sendMessage(tabs[0].id, {action: 'extractRepoInfo'}, async (response) => {
          if (response) {
            const { owner, repo } = response;
            try {
              const result = await queryRepo(owner, repo, question);
              addMessage(result.answer, false);
            } catch (error) {
              addMessage('Sorry, I encountered an error processing your question.', false);
            }
          } else {
            addMessage('Could not extract repository information. Please make sure you are on a GitHub repository page.', false);
          }
        });
      });
    }

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && chatInput.value.trim()) {
        const question = chatInput.value.trim();
        chatInput.value = '';
        handleQuestion(question);
      }
    });

    // Add close button event listener
    const closeBtn = document.getElementById('close-chat-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeChatOverlay);
    }

    chatSend.addEventListener('click', () => {
      if (chatInput.value.trim()) {
        const question = chatInput.value.trim();
        chatInput.value = '';
        handleQuestion(question);
      }
    });
  }

  window.closeChatOverlay = function() {
    if (chatOverlay && chatOverlay.parentElement) {
      chatOverlay.parentElement.removeChild(chatOverlay);
      chatOverlay = null;
    }
  }

  chatIcon.addEventListener('click', () => {
    if (!chatOverlay) {
      createChatOverlay();
    }
  });
// THEME TOGGLE UI - Original positioning with improved animations
const themeToggle = document.createElement('button');
themeToggle.id = 'theme-toggle';
themeToggle.innerHTML = '🌙'; // Default to moon icon for light mode
themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
themeToggle.style.cssText = [
  'position: absolute',
  'top: 8px',
  'left: 8px',
  'z-index: 10001',
  'width: 32px',
  'height: 32px',
  'display: flex',
  'align-items: center',
  'justify-content: center',
  'font-size: 18px',
  'background: transparent',
  'border: none',
  'border-radius: 0',
  'cursor: pointer',
  'transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  'box-shadow: none',
  'color: #374151',
  'overflow: hidden'
].join(';') + ';'

// Theme toggle functionality with smooth animations
function setTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-theme');
    // Animate sun icon appearance
    themeToggle.style.transform = 'scale(0.8) rotate(180deg)';
    setTimeout(() => {
      themeToggle.innerHTML = '☀️';
      themeToggle.style.transform = 'scale(1) rotate(0deg)';
    }, 150);
    themeToggle.style.background = 'transparent';
    themeToggle.style.border = 'none';
    themeToggle.style.color = '#f1f5f9';
  } else {
    document.body.classList.remove('dark-theme');
    // Animate moon icon appearance
    themeToggle.style.transform = 'scale(0.8) rotate(-180deg)';
    setTimeout(() => {
      themeToggle.innerHTML = '🌙';
      themeToggle.style.transform = 'scale(1) rotate(0deg)';
    }, 150);
    themeToggle.style.background = 'transparent';
    themeToggle.style.border = 'none';
    themeToggle.style.color = '#374151';
  }
  
  // Ensure transform is reset after animation completes
  setTimeout(() => {
    if (!themeToggle.classList.contains('animating')) {
      themeToggle.style.transform = '';
    }
  }, 300);
}

// Enhanced click handler with animation
themeToggle.onclick = () => {
  // Prevent multiple rapid clicks
  if (themeToggle.classList.contains('animating')) return;
  
  themeToggle.classList.add('animating');
  const isDark = !document.body.classList.contains('dark-theme');
  
  // Add click animation
  themeToggle.style.transform = 'scale(0.9)';
  
  setTimeout(() => {
    setTheme(isDark);
    chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
    
    // Remove animation class after transition
    setTimeout(() => {
      themeToggle.classList.remove('animating');
      // Reset transform to prevent accumulation
      themeToggle.style.transform = '';
    }, 300);
  }, 100);
};

// Enhanced hover effects
themeToggle.onmouseover = function() {
  if (!themeToggle.classList.contains('animating')) {
    themeToggle.style.transform = 'scale(1.1)';
    themeToggle.style.boxShadow = 'none';
  }
};

themeToggle.onmouseout = function() {
  if (!themeToggle.classList.contains('animating')) {
    themeToggle.style.transform = 'scale(1)';
    themeToggle.style.boxShadow = 'none';
  }
};

// Add a safeguard to reset transforms if they get corrupted
function resetThemeToggleTransform() {
  if (themeToggle && !themeToggle.classList.contains('animating')) {
    themeToggle.style.transform = '';
  }
}

// Reset transform on window focus to prevent stuck states
window.addEventListener('focus', resetThemeToggleTransform);

// Add CSS animations for the theme toggle
const themeToggleStyle = document.createElement('style');
themeToggleStyle.textContent = `
  #theme-toggle {
    position: absolute !important;
    top: 8px !important;
    left: 8px !important;
    z-index: 10001 !important;
    transform-origin: center !important;
    will-change: transform !important;
  }
  
  #theme-toggle.animating {
    pointer-events: none;
  }
  
  #theme-toggle {
    font-size: 18px !important;
    line-height: 1 !important;
    text-align: center !important;
    vertical-align: middle !important;
  }
  
  /* Ensure emojis are always visible */
  #theme-toggle::before {
    display: none !important;
  }
  
  @keyframes iconSlideUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    50% { transform: translateY(-20px) scale(0.8); opacity: 0.5; }
    100% { transform: translateY(-40px) scale(0.6); opacity: 0; }
  }
  
  @keyframes iconSlideDown {
    0% { transform: translateY(-40px) scale(0.6); opacity: 0; }
    50% { transform: translateY(-20px) scale(0.8); opacity: 0.5; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  
  #theme-toggle.animating::before {
    content: attr(data-icon);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    animation: iconSlideUp 0.3s ease-out forwards;
  }
  
  /* Prevent positioning glitches */
  #theme-toggle, #history-icon {
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
    perspective: 1000px !important;
    -webkit-perspective: 1000px !important;
  }
`;

document.head.appendChild(themeToggleStyle);
document.body.appendChild(themeToggle);

// Load saved theme
chrome.storage.local.get({ theme: 'light' }, (result) => {
  setTheme(result.theme === 'dark');
});

// Theme toggle positioning is now handled by CSS
  const summarizeBtn = document.getElementById('summarizeBtn');
  
  const summaryDiv = document.getElementById('summary');
  const historyIcon = document.getElementById('history-icon');
  const askPanel = document.getElementById('ask-repo');
  const askInput = document.getElementById('askInput');
  const askBtn = document.getElementById('askBtn');
  const askResult = document.getElementById('askResult');
  let RAG_API_BASE = 'http://localhost:8000';
  chrome.storage.local.get({ ragApiBase: null }, (cfg) => {
    if (cfg && cfg.ragApiBase) {
      RAG_API_BASE = cfg.ragApiBase;
    }
  });
  if (historyIcon) {
  const updateHistoryIconTheme = () => {
    if (document.body.classList.contains('dark-theme')) {
      historyIcon.style.color = '#f1f5f9';
    } else {
      historyIcon.style.color = '#374151';
    }
  };
  
  
  // Add observer for theme changes
  const observer = new MutationObserver(updateHistoryIconTheme);
  observer.observe(document.body, { 
    attributes: true, 
    attributeFilter: ['class'] 
  });
  
  // Enhanced hover effects for history icon
  historyIcon.onmouseover = function() {
    historyIcon.style.transform = 'scale(1.1)';
    historyIcon.style.boxShadow = 'none';
  };
  
  historyIcon.onmouseout = function() {
    historyIcon.style.transform = 'scale(1)';
    historyIcon.style.boxShadow = 'none';
  };
  
  historyIcon.onclick = function() {
    // Add click animation
    historyIcon.style.transform = 'scale(0.95)';
    setTimeout(() => {
      historyIcon.style.transform = 'scale(1)';
    }, 150);
  };
}
  let projectPaper = '';
  let historyOverlay = null;
  let currentTab = 'analyzed';

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentUrl = tabs[0].url;
    if (!currentUrl.includes('github.com')) {
      showGitHubError();
      summarizeBtn.disabled = true;
    }
  });

  function fetchWithTimeout(resource, options = {}, timeout = 20000) {
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
    ]);
  }

  function showAskPanel() {
    if (askPanel) {
      askPanel.style.display = 'block';
    }
  }

  function hideAskPanel() {
    if (askPanel) {
      askPanel.style.display = 'none';
    }
  }

  async function buildEmbeddings(owner, repo) {
    return new Promise((resolve) => {
      const storageKey = `ragBuilt:${owner}/${repo}`;
      chrome.storage.local.get({ [storageKey]: null }, async (result) => {
        const builtInfo = result[storageKey];
        const staleAfterMs = 7 * 24 * 60 * 60 * 1000;
        const isFresh = builtInfo && (Date.now() - builtInfo.timestamp < staleAfterMs);
        if (isFresh) {
          resolve({ skipped: true });
          return;
        }
        try {
          if (askBtn) askBtn.disabled = true;
          if (askResult) {
            askResult.innerHTML = '<div style="font-size: 13px; color: var(--empty-desc);">Indexing repo for semantic search…</div>';
          }
          const res = await fetch(`${RAG_API_BASE}/build_embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner, repo })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'Failed to build embeddings');
          chrome.storage.local.set({ [storageKey]: { timestamp: Date.now(), stats: data } });
          if (askResult) {
            askResult.innerHTML = `<div style="font-size: 13px; color: var(--empty-desc);">Indexed ${data.num_files_indexed} files and ${data.num_chunks_indexed} chunks in ${data.took_seconds}s.</div>`;
          }
          resolve({ skipped: false, data });
        } catch (e) {
          if (askResult) {
            askResult.innerHTML = `<div style=\"font-size: 13px; color: #dc2626;\">Indexing failed: ${e.message}. You can still try asking.</div>`;
          }
          resolve({ error: e });
        } finally {
          if (askBtn) askBtn.disabled = false;
        }
      });
    });
  }

  async function queryRepo(owner, repo, question) {
    const res = await fetch(`${RAG_API_BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, repo, question })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Query failed');
    return data;
  }

function renderQueryResult(result) {
  if (!askResult) return;
  
  // Parse the answer to identify citation markers like [1], [2], etc.
  let answerText = result.answer || 'No answer available';
  
  // Create citation lookup map
  const citationMap = {};
  if (result.references && result.references.length > 0) {
    result.references.forEach((ref, idx) => {
      citationMap[idx + 1] = ref;
    });
  }
  
  // Replace citation markers with interactive badges
  answerText = answerText.replace(/\[(\d+)\]/g, (match, num) => {
    const citation = citationMap[parseInt(num)];
    if (citation) {
      return `<span class="citation-badge" data-citation="${num}" title="Click to view code" style="cursor: pointer;">
        <sup class="citation-number" style="color: var(--tab-active-color); font-weight: 600; padding: 2px 4px; border-radius: 4px; background: rgba(102, 126, 234, 0.1);">[${num}]</sup>
      </span>`;
    }
    return match;
  });
  
  const answerHtml = `
    <div class="answer-container" style="background: var(--summary-bg); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid var(--tab-active-color);">
      <div class="answer-text" style="white-space: pre-wrap; line-height: 1.8; color: var(--modal-title);">${answerText}</div>
    </div>
    
    <div id="citation-preview" style="display: none; background: var(--modal-bg); border: 1px solid var(--modal-border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 600; color: var(--modal-title); font-size: 13px;">📄 Code Reference</span>
        <button id="close-preview" style="background: none; border: none; color: var(--modal-close); cursor: pointer; font-size: 18px;">×</button>
      </div>
      <div id="preview-content" style="font-family: 'Courier New', monospace; font-size: 12px; background: var(--summary-bg); padding: 12px; border-radius: 6px; overflow-x: auto; max-height: 200px; overflow-y: auto;">
      </div>
      <a id="preview-link" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; color: var(--tab-active-color); text-decoration: none; font-size: 12px;">
        <span>View in GitHub</span>
        <span class="material-icons" style="font-size: 14px;">open_in_new</span>
      </a>
    </div>
  `;
  
  let refsHtml = '';
  if (result.references && result.references.length > 0) {
    const refItems = result.references.map((r, idx) => {
      const label = `${r.file_path}`;
      const lines = `L${r.start_line}-${r.end_line}`;
      const href = r.url || '#';
      
      return `
        <div class="reference-item" data-ref-id="${idx + 1}" style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin: 6px 0;
          background: var(--modal-bg);
          border: 1px solid var(--modal-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='var(--tab-active-color)'; this.style.transform='translateX(4px)';" onmouseout="this.style.borderColor='var(--modal-border)'; this.style.transform='translateX(0)';">
          
          <span style="
            background: var(--tab-active-color);
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 11px;
            flex-shrink: 0;
          ">${idx + 1}</span>
          
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: 13px; color: var(--modal-title); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${label}</div>
            <div style="font-size: 11px; color: var(--empty-desc); margin-top: 2px;">${lines}</div>
          </div>
          
          <div style="display: flex; gap: 8px; flex-shrink: 0;">
            <button class="preview-ref-btn" data-ref-id="${idx + 1}" style="
              background: var(--summary-bg);
              border: 1px solid var(--modal-border);
              color: var(--modal-title);
              padding: 6px 10px;
              border-radius: 6px;
              font-size: 11px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
              transition: all 0.2s ease;
            " onmouseover="this.style.background='var(--tab-active-color)'; this.style.color='white'; this.style.borderColor='var(--tab-active-color)';" onmouseout="this.style.background='var(--summary-bg)'; this.style.color='var(--modal-title)'; this.style.borderColor='var(--modal-border)';">
              <span class="material-icons" style="font-size: 14px;">visibility</span>
              Preview
            </button>
            
            <a href="${href}" target="_blank" style="
              background: var(--tab-active-color);
              color: white;
              padding: 6px 10px;
              border-radius: 6px;
              font-size: 11px;
              text-decoration: none;
              display: flex;
              align-items: center;
              gap: 4px;
              transition: all 0.2s ease;
            " onmouseover="this.style.opacity='0.9';" onmouseout="this.style.opacity='1';">
              <span class="material-icons" style="font-size: 14px;">open_in_new</span>
              Open
            </a>
          </div>
        </div>
      `;
    }).join('');
    
    refsHtml = `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--modal-border);">
        <div style="font-weight: 600; margin-bottom: 12px; color: var(--modal-title); font-size: 14px; display: flex; align-items: center; gap: 8px;">
          <span class="material-icons" style="font-size: 18px;">link</span>
          Code References (${result.references.length})
        </div>
        ${refItems}
      </div>
    `;
  }
  
  askResult.innerHTML = answerHtml + refsHtml;
  askResult.scrollTop = 0;
  
  // CRITICAL: Add event listeners AFTER innerHTML is set
  // Add event listeners for citation badges in the answer
  const citationBadges = askResult.querySelectorAll('.citation-badge');
  citationBadges.forEach(badge => {
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const citationNum = parseInt(e.currentTarget.dataset.citation);
      showCitationPreview(citationNum, result.references);
    });
  });
  
  // Add event listeners for preview buttons
  const previewBtns = askResult.querySelectorAll('.preview-ref-btn');
  previewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const refId = parseInt(e.currentTarget.dataset.refId);
      showCitationPreview(refId, result.references);
    });
  });
  
  // Close preview button
  const closePreviewBtn = askResult.querySelector('#close-preview');
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', () => {
      document.getElementById('citation-preview').style.display = 'none';
    });
  }
}

// NEW FUNCTION: Add this AFTER renderQueryResult function
async function showCitationPreview(citationNum, references) {
  const preview = document.getElementById('citation-preview');
  const previewContent = document.getElementById('preview-content');
  const previewLink = document.getElementById('preview-link');
  
  if (!preview || !previewContent || !previewLink) return;
  
  const ref = references[citationNum - 1];
  if (!ref) return;
  
  // Show loading state
  preview.style.display = 'block';
  previewContent.innerHTML = '<div style="text-align: center; color: var(--empty-desc);">Loading code preview...</div>';
  
  try {
    // Fetch the code snippet from GitHub
    const urlParts = ref.url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+?)#L(\d+)-L(\d+)/);
    if (urlParts) {
      const [, owner, repo, branch, filepath, startLine, endLine] = urlParts;
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
      
      const response = await fetch(rawUrl);
      if (response.ok) {
        const fullText = await response.text();
        const lines = fullText.split('\n');
        const start = parseInt(startLine) - 1;
        const end = parseInt(endLine);
        const snippet = lines.slice(start, end).join('\n');
        
        // Escape HTML
        const highlighted = escapeHtml(snippet);
        
        previewContent.innerHTML = `
          <div style="margin-bottom: 8px; font-size: 11px; color: var(--empty-desc); font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
            ${ref.file_path} (lines ${startLine}-${endLine})
          </div>
          <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; line-height: 1.5; color: var(--modal-text);">${highlighted}</pre>
        `;
        previewLink.href = ref.url;
      } else {
        throw new Error('Failed to fetch code');
      }
    }
  } catch (error) {
    previewContent.innerHTML = `
      <div style="text-align: center; color: #ef4444;">
        Unable to load preview. <a href="${ref.url}" target="_blank" style="color: var(--tab-active-color);">View on GitHub</a>
      </div>
    `;
  }
}

// NEW FUNCTION: Add this AFTER showCitationPreview
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ENHANCED CSS: Add this at the very end of your DOMContentLoaded event listener
// (around line 1800, just before the closing });)
const enhancedCitationStyles = document.createElement('style');
enhancedCitationStyles.textContent = `
  .citation-badge {
    cursor: pointer !important;
    display: inline-block !important;
    transition: all 0.2s ease !important;
    margin: 0 2px !important;
  }
  
  .citation-badge:hover {
    transform: scale(1.15) !important;
  }
  
  .citation-number {
    color: var(--tab-active-color) !important;
    font-weight: 600 !important;
    text-decoration: none !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    background: rgba(102, 126, 234, 0.1) !important;
    transition: all 0.2s ease !important;
  }
  
  .citation-badge:hover .citation-number {
    background: var(--tab-active-color) !important;
    color: white !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
  }
  
  .citation-badge:active {
    transform: scale(0.95) !important;
  }
  
  .reference-item {
    position: relative !important;
  }
  
  .reference-item::before {
    content: '' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 3px !important;
    background: transparent !important;
    border-radius: 3px !important;
    transition: all 0.2s ease !important;
  }
  
  .reference-item:hover::before {
    background: var(--tab-active-color) !important;
  }
  
  #citation-preview {
    animation: slideDown 0.3s ease-out !important;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .preview-ref-btn {
    position: relative !important;
    overflow: hidden !important;
  }
  
  .preview-ref-btn::after {
    content: '' !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    width: 0 !important;
    height: 0 !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.5) !important;
    transform: translate(-50%, -50%) !important;
    transition: width 0.3s, height 0.3s !important;
  }
  
  .preview-ref-btn:active::after {
    width: 100px !important;
    height: 100px !important;
  }
`;
document.head.appendChild(enhancedCitationStyles);
  function initializeAskRepo(owner, repo) {
    if (!owner || !repo) return;
    showAskPanel();
    buildEmbeddings(owner, repo);
    if (askBtn) {
      askBtn.onclick = async () => {
        try {
          const question = (askInput && askInput.value ? askInput.value.trim() : '');
          if (!question) return;
          askBtn.disabled = true;
          askBtn.textContent = 'Asking…';
          askResult.innerHTML = '<div style="font-size: 13px; color: var(--empty-desc);">Retrieving relevant code…</div>';
          const result = await queryRepo(owner, repo, question);
          renderQueryResult(result);
        } catch (e) {
          askResult.innerHTML = `<div style=\"color:#dc2626;\">${e.message}</div>`;
        } finally {
          askBtn.disabled = false;
          askBtn.textContent = 'Ask';
        }
      };
    }
  }

  chrome.storage.local.get(['summaryStatus', 'summaryResult', 'summaryTab','chatOverlayOpen'], (result) => {
    if (result.summaryStatus === 'pending') {
      showMessage('Extracting repository information...', 'loading');
      setLoadingState(true);
      hideInteractiveButtons();
    } else if (result.summaryStatus === 'done' && result.summaryResult) {
      showMessage(result.summaryResult.summary, 'success');
      projectPaper = result.summaryResult.project_paper;
      showInteractiveButtons();
      downloadBtn.style.display = 'block';
      clearSessionBtn.style.display = 'block';
      downloadBtn.style.background = '#10b981';
      downloadBtn.style.color = 'white';
      downloadBtn.style.border = 'none';
      downloadBtn.style.boxShadow = 'none';
      downloadBtn.style.opacity = '1';
      downloadBtn.style.transform = 'translateY(0)';
      setLoadingState(false);
      if (result.summaryResult.owner && result.summaryResult.repo) {
      initializeAskRepo(result.summaryResult.owner, result.summaryResult.repo);
    } else {
      hideAskPanel();
    }
  if (result.chatOverlayOpen) {
      createChatOverlay();
    }
  } else {
    hideInteractiveButtons();
  }
});
  // else {
  //   // Hide and reset download button if not available
  //   downloadBtn.style.display = 'none';
  //   downloadBtn.style.background = '';
  //   downloadBtn.style.color = '';
  //   downloadBtn.style.border = '';
  //   downloadBtn.style.boxShadow = '';
  //   downloadBtn.style.opacity = '';
  //   downloadBtn.style.transform = '';
  //   hideInteractiveButtons();
  // }
// });


  summarizeBtn.addEventListener('click', async () => {
    try {
      setLoadingState(true);
      showMessage('Extracting repository information...', 'loading');
      chrome.storage.local.set({ summaryStatus: 'pending', summaryResult: null });
      console.log('[Xtension] Extraction started. Querying active tab for repo info...');
      let stillWorkingTimeout = null;
      chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        try {
          trackVisitedRepo(tabs[0].url);
          const sendMessageWithTimeout = (tabId, message, timeout = 30000) => {
            return new Promise((resolve, reject) => {
              let didRespond = false;
              const timer = setTimeout(() => {
                if (!didRespond) {
                  didRespond = true;
                  console.error('[Xtension] Extraction timed out.');
                  setLoadingState(false);
                  showTimeoutError();
                  chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
                  reject(new Error('Timed out extracting repository information. The repository may be too large or the page is not supported.'));
                }
              }, timeout);
              chrome.tabs.sendMessage(tabId, message, (response) => {
                if (!didRespond) {
                  clearTimeout(timer);
                  didRespond = true;
                  console.log('[Xtension] Extraction response received:', response);
                  resolve(response);
                }
              });
            });
          };

          let repoInfo;
          try {
            repoInfo = await sendMessageWithTimeout(tabs[0].id, {action: 'extractRepoInfo'}, 30000);
            console.log('[Xtension] Repo info extracted:', repoInfo);
          } catch (timeoutErr) {
            return;
          }
          if (!repoInfo) {
            setLoadingState(false);
            showMessage('Could not extract repository information. Please make sure you\'re on a GitHub repository page.', 'error', 'extraction-error');
            chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
            return;
          }
          showMessage('Generating AI summary...', 'loading');
          console.log('[Xtension] Sending repo info to backend:', repoInfo);
          stillWorkingTimeout = setTimeout(() => {
            showMessage('Still working... Large repositories may take up to 30 seconds. Please wait.', 'loading');
            console.log('[Xtension] Still working... waiting for backend response.');
          }, 20000);
          try {
            const response = await fetchWithTimeout('https://xtension-git-main-srivatsavavuppalas-projects.vercel.app/api/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(repoInfo)
            }, 30000);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.error) {
              throw new Error(data.error);
            }
            clearTimeout(stillWorkingTimeout);
            setLoadingState(false);
            showMessage(data.summary, 'success');
            projectPaper = data.project_paper;
            showInteractiveButtons();
            if(clearSessionBtn){
              clearSessionBtn.style.display = 'block'
            }
            chrome.storage.local.set({ summaryStatus: 'done', summaryResult: data, summaryTab: tabs[0].url });
            const now = Date.now();
            const historyItem = {
              url: tabs[0].url,
              owner: repoInfo.owner,
              repo: repoInfo.repo,
              description: repoInfo.description,
              summary: data.summary,
              timestamp: now,
              projectPaper: data.project_paper
            };
            saveToAnalyzedHistory(historyItem);
            setTimeout(() => {
              downloadBtn.style.opacity = '1';
              downloadBtn.style.transform = 'translateY(0)';
            }, 100);
            console.log('[Xtension] Summarization complete.');
            if (repoInfo && repoInfo.owner && repoInfo.repo) {
              const owner = data.owner || repoInfo.owner;
              const repo = data.repo || repoInfo.repo;
              initializeAskRepo(owner, repo);
            }
          } catch (fetchError) {
            clearTimeout(stillWorkingTimeout);
            setLoadingState(false);
            showMessage(`Error generating summary: ${fetchError.message}. Please try again later or contact support if the problem persists.`, 'error', 'api-error');
            chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
            console.error('[Xtension] Summarization error:', fetchError);
          }
        } catch (tabError) {
          clearTimeout(stillWorkingTimeout);
          setLoadingState(false);
          showMessage('Error accessing the current tab. Please refresh the page and try again.', 'error', 'extraction-error');
          chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
          console.error('[Xtension] Tab access error:', tabError);
        }
      });
    } catch (error) {
      setLoadingState(false);
      showMessage(`Unexpected error: ${error.message}`, 'error');
      chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
      console.error('[Xtension] Unexpected error:', error);
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!projectPaper) {
      showMessage('No project report available to download.', 'error');
      return;
    }
    try {
      const blob = new Blob([projectPaper], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'github_project_report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '✅ Downloaded!';
      downloadBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.style.background = '';
      }, 2000);
    } catch (error) {
      showMessage('Error downloading file: ' + error.message, 'error');
    }
  });
  

  if (clearSessionBtn) {
    clearSessionBtn.addEventListener('click', () => {
      chrome.storage.local.remove(['summaryStatus', 'summaryResult', 'summaryTab', 'chatOverlayOpen'], () => {
        showMessage('Session cleared. You can generate a new summary now.', 'info');
        hideInteractiveButtons();
        if (clearSessionBtn){
          clearSessionBtn.style.display = 'none';
        }
        hideAskPanel();
        closeChatOverlay();
      });
    });
  }

  function trackVisitedRepo(url) {
    if (!url.includes('github.com')) return;
    const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return;
    const owner = match[1];
    const repo = match[2];
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const visitedItem = {
      url,
      owner,
      repo,
      timestamp: now,
      visitCount: 1
    };
    chrome.storage.local.get({ visitedRepos: [] }, (result) => {
      let visited = result.visitedRepos;
      const existingIndex = visited.findIndex(item => item.url === url);
      if (existingIndex !== -1) {
        visited[existingIndex].timestamp = now;
        visited[existingIndex].visitCount++;
      } else {
        visited.unshift(visitedItem);
      }
      visited = visited.filter(item => (now - item.timestamp) < oneWeek);
      visited = visited.slice(0, 50);
      chrome.storage.local.set({ visitedRepos: visited });
    });
  }

  function saveToAnalyzedHistory(historyItem) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    chrome.storage.local.get({ analyzedHistory: [] }, (result) => {
      let history = result.analyzedHistory;
      history = history.filter(item => item.url !== historyItem.url && (now - item.timestamp) < oneDay);
      history.unshift(historyItem);
      const limited = history.slice(0, 20);
      chrome.storage.local.set({ analyzedHistory: limited });
    });
  }

  function showHistoryOverlay() {
    if (historyOverlay) return;
    historyOverlay = document.createElement('div');
    historyOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px;
      box-sizing: border-box;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.3s ease-out;
    `;
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--modal-bg);
      border-radius: 18px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      width: 380px;
      max-width: 98vw;
      margin-top: 40px;
      animation: slideUp 0.3s ease-out;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      color: var(--modal-text);
      border: 1px solid var(--modal-border);
    `;
    modal.className = 'history-modal';
    const header = document.createElement('div');
header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 18px 24px 0 24px;';
const title = document.createElement('div');
title.textContent = 'Repo History ⏳';
title.style.cssText = 'font-size: 15px; font-weight: 600; color: var(--modal-title); max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
const closeBtn = document.createElement('button');
closeBtn.innerHTML = '✖';
closeBtn.setAttribute('aria-label', 'Close');
closeBtn.style.cssText = 'width: 32px; height: 32px; min-width: 32px; min-height: 32px; max-width: 32px; max-height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; font-size: 18px; color: var(--modal-close); cursor: pointer; border-radius: 6px; transition: background 0.2s; margin-left: 8px;';
closeBtn.onmouseover = () => { closeBtn.style.background = 'var(--modal-hover)'; };
closeBtn.onmouseout = () => { closeBtn.style.background = 'none'; };
header.appendChild(title);
header.appendChild(closeBtn);
modal.appendChild(header);
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = 'display: flex; border-bottom: 1px solid #e2e8f0; margin: 18px 0 0 0; z-index: 10002;';
    const tabs = [
      { id: 'analyzed', label: '📊 Analyzed' },
      { id: 'visited', label: '🔗 Visited' },
      { id: 'favorites', label: '❤️ Favorites' }
    ];
    tabs.forEach(tab => {
      const tabBtn = document.createElement('button');
      tabBtn.innerHTML = '<span style="margin-right: 8px;">' + tab.label.split(' ')[0] + '</span> ' + tab.label.split(' ')[1];
      tabBtn.style.cssText =
        'flex: 1;' +
        'padding: 16px 20px;' +
        'border: none;' +
        'background: ' + (currentTab === tab.id ? 'var(--tab-active-bg)' : 'var(--tab-inactive-bg)') + ';' +
        'color: ' + (currentTab === tab.id ? 'var(--tab-active-color)' : 'var(--tab-inactive-color)') + ';' +
        'font-weight: ' + (currentTab === tab.id ? '600' : '500') + ';' +
        'font-size: 14px;' +
        'cursor: pointer;' +
        'transition: all 0.2s ease;' +
        'border-bottom: 3px solid ' + (currentTab === tab.id ? 'var(--tab-active-color)' : 'transparent') + ';' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;';
      tabBtn.onmouseover = () => {
        if (currentTab !== tab.id) {
          tabBtn.style.background = '#f1f5f9';
        }
      };
      tabBtn.onmouseout = () => {
        if (currentTab !== tab.id) {
          tabBtn.style.background = 'transparent';
        }
      };
      tabBtn.onclick = () => {
        currentTab = tab.id;
        loadHistoryContent();
        updateTabStyles();
      };
      tabContainer.appendChild(tabBtn);
    });
    modal.appendChild(tabContainer);
    const contentContainer = document.createElement('div');
    contentContainer.id = 'history-content';
    modal.appendChild(contentContainer);
    function updateTabStyles() {
      const tabButtons = tabContainer.querySelectorAll('button');
      tabButtons.forEach(function(btn, index) {
        var isActive = tabs[index].id === currentTab;
        btn.style.background = isActive ? '#fff' : 'transparent';
        btn.style.color = isActive ? '#667eea' : '#64748b';
        btn.style.fontWeight = isActive ? '600' : '500';
        btn.style.borderBottom = '3px solid ' + (isActive ? '#667eea' : 'transparent');
      });
    }
    historyOverlay.appendChild(modal);
    document.body.appendChild(historyOverlay);
    
    // Add overlay-open class to hide theme toggle and history icon
    document.body.classList.add('overlay-open');
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    closeBtn.onclick = closeHistoryOverlay;
    historyOverlay.onclick = (e) => {
      if (e.target === historyOverlay) {
        closeHistoryOverlay();
      }
    };
    loadHistoryContent();
  }

  function closeHistoryOverlay() {
    if (historyOverlay) {
      historyOverlay.style.animation = 'fadeOut 0.2s ease-out forwards';
      const modal = historyOverlay.querySelector('div');
      modal.style.animation = 'slideDown 0.2s ease-out forwards';
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(30px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
      setTimeout(() => {
        if (historyOverlay) {
          historyOverlay.remove();
          historyOverlay = null;
        }
        document.head.removeChild(style);
        // Remove overlay-open class to show icons again
        document.body.classList.remove('overlay-open');
      }, 200);
    }
  }

  function loadHistoryContent() {
    const container = document.getElementById('history-content');
    if (!container) return;
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b;">Loading...</div>';
    if (currentTab === 'analyzed') {
      loadAnalyzedHistory(container);
    } else if (currentTab === 'visited') {
      loadVisitedHistory(container);
    } else if (currentTab === 'favorites') {
      loadFavoritesHistory(container);
    }
  }

  function loadAnalyzedHistory(container) {
    chrome.storage.local.get({ analyzedHistory: [] }, (result) => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const history = result.analyzedHistory.filter(item => (now - item.timestamp) < oneDay);
      if (history.length === 0) {
        container.innerHTML = createEmptyState('📊', 'No analyzed repositories', 'Analyze some repositories to see them here!');
      } else {
        container.innerHTML = '';
        history.forEach((item, index) => {
          const historyItem = createAnalyzedHistoryItem(item, index);
          container.appendChild(historyItem);
        });
      }
    });
  }

  function loadVisitedHistory(container) {
    chrome.storage.local.get({ visitedRepos: [] }, (result) => {
      const visited = result.visitedRepos;
      if (visited.length === 0) {
        container.innerHTML = createEmptyState('🔗', 'No visited repositories', 'Browse GitHub repositories to see them here!');
      } else {
        container.innerHTML = '';
        visited.forEach((item, index) => {
          const historyItem = createVisitedHistoryItem(item, index);
          container.appendChild(historyItem);
        });
      }
    });
  }

  function loadFavoritesHistory(container) {
    chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
      const favorites = result.favoriteRepos || [];
      if (favorites.length === 0) {
        container.innerHTML = createEmptyState('❤️', 'No favorite repositories', 'Star repositories to add them to favorites!');
      } else {
        container.innerHTML = '';
        favorites.forEach((item, index) => {
          const historyItem = createFavoriteHistoryItem(item, index);
          container.appendChild(historyItem);
        });
      }
    });
  }

  function createEmptyState(icon, title, description) {
    return `
      <div style="text-align: center; padding: 60px 20px; color: var(--empty-desc);">
        <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.6;">${icon}</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--empty-title);">${title}</div>
        <div style="font-size: 14px; line-height: 1.5; color: var(--empty-desc);">${description}</div>
      </div>
    `;
  }

  function createAnalyzedHistoryItem(item, index) {
  const itemDiv = document.createElement('div');
  itemDiv.style.cssText = `
    background: var(--history-item-bg);
    margin: 12px 12px;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--history-item-border);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    color: var(--history-item-text);
  `;

  itemDiv.onmouseover = () => {
    itemDiv.style.transform = 'translateY(-2px)';
    itemDiv.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    itemDiv.style.borderColor = '#667eea';
  };
  itemDiv.onmouseout = () => {
    itemDiv.style.transform = 'translateY(0)';
    itemDiv.style.boxShadow = 'none';
    itemDiv.style.borderColor = '#e2e8f0';
  };

  let isFavorite = false;
  try {
    const favs = JSON.parse(localStorage.getItem('favoriteRepos') || '[]');
    isFavorite = favs.some(f => f.url === item.url);
  } catch {}

  itemDiv.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <img src="../icons/icon16.png" alt="Repo" style="width:18px; height:18px; margin-right: 10px; border-radius: 4px;">
          <a href="${item.url}" target="_blank" style="font-weight: 700; color: var(--modal-title); text-decoration: none; font-size: 12px;">
            ${item.owner}/${item.repo}
          </a>
        </div>
        <span style="color: var(--empty-desc); font-size: 11px; background: var(--summary-bg); padding: 3px 7px; border-radius: 6px; white-space: nowrap;">
          ${formatTimestamp(item.timestamp)}
        </span>
      </div>
      <div style="color: var(--empty-desc); font-size: 14px; margin-bottom: 12px; line-height: 1.4;">
        ${item.description || 'No description available'}
      </div>
      <div style="color: var(--modal-title); font-size: 14px; line-height: 1.5; background: var(--summary-bg); padding: 12px; border-radius: 8px; border-left: 3px solid #667eea;">
        ${item.summary ? (item.summary.length > 120 ? item.summary.substring(0, 120) + '...' : item.summary) : 'No summary available'}
      </div>
      <div class="analyzed-btn-row" style="display: flex; gap: 8px; margin-top: 12px;"></div>
    </div>
  `;

  const btnRow = itemDiv.querySelector('.analyzed-btn-row');
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = '📄 Download Report';
  downloadBtn.style.cssText = 'background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;';
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    window.downloadReport(item.url);
  };
  btnRow.appendChild(downloadBtn);

const favBtn = document.createElement('button');
favBtn.className = 'favorite-btn';
favBtn.style.cssText = 'background: none; color: #f59e0b; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 4px;';
favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px;">☆</span> <span>Add to Favorites</span>';

chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
  const favs = result.favoriteRepos || [];
  const exists = favs.some(f => f.url === item.url);
  if (exists) {
    favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px; color: #f59e0b;">★</span> <span>Favorited</span>';
    favBtn.style.background = 'rgba(245, 158, 11, 0.08)';
  } else {
    favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px;">☆</span> <span>Add to Favorites</span>';
    favBtn.style.background = 'none';
  }
});

favBtn.onclick = (e) => {
  e.stopPropagation();
  chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
    let favs = result.favoriteRepos || [];
    const exists = favs.some(f => f.url === item.url);
    if (exists) {
      favs = favs.filter(f => f.url !== item.url);
      favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px;">☆</span> <span>Add to Favorites</span>';
      favBtn.style.background = 'none';
    } else {
      favs.push({ url: item.url, owner: item.owner, repo: item.repo, timestamp: Date.now() });
     favBtn.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; width: 100%;"><span class="fav-star" style="font-size: 15px; color: #f59e0b;">★</span><span style="display: block; text-align: center;">Favorited</span></div>';
      favBtn.style.background = 'rgba(245, 158, 11, 0.08)';
    }
    chrome.storage.local.set({ favoriteRepos: favs }, () => {
      if (typeof currentTab !== 'undefined' && currentTab === 'favorites') {
        loadHistoryContent();
      }
    });
  });
};
btnRow.appendChild(favBtn);

  itemDiv.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
      showMessage(item.summary, 'success');
      closeHistoryOverlay();
    }
  };

  return itemDiv;
}

  function createVisitedHistoryItem(item, index) {
  const itemDiv = document.createElement('div');
  itemDiv.style.cssText = `
    background: var(--history-item-bg);
    margin: 16px 20px;
    border-radius: 14px;
    padding: 16px;
    border: 1px solid var(--history-item-border);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    color: var(--history-item-text);
  `;
  itemDiv.onmouseover = () => {
    itemDiv.style.transform = 'translateY(-1px)';
    itemDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
  };
  itemDiv.onmouseout = () => {
    itemDiv.style.transform = 'translateY(0)';
    itemDiv.style.boxShadow = 'none';
  };
  itemDiv.innerHTML = `
  <div style="display: flex; align-items: center; justify-content: space-between; overflow: hidden;">
    <div style="display: flex; align-items: center;">
      <div style="color: var(--tree-file-text); padding: 3px 6px; font-size: 11px; font-weight: 600; margin-right: 10px; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
        <span style="font-size: 14px;">🔗</span>${item.visitCount > 1 ? `${item.visitCount}x` : ''}
      </div>
      <a href="${item.url}" target="_blank" style="font-weight: 600; color: var(--modal-title); text-decoration: none; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${item.repo}
      </a>
    </div>
    <span style="color: var(--empty-desc); font-size: 11px; background: var(--summary-bg); padding: 3px 6px; border-radius: 4px; white-space: nowrap;">
      ${formatTimestamp(item.timestamp)}
    </span>
  </div>
`;
  itemDiv.onclick = () => {
    window.open(item.url, '_blank');
  };
  return itemDiv;
}
function createFavoriteHistoryItem(item, index) {
  const itemDiv = document.createElement('div');
  itemDiv.style.cssText = `
    background: var(--history-item-bg);
    margin: 12px 12px;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--history-item-border);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    color: var(--history-item-text);
  `;

  itemDiv.onmouseover = () => {
    itemDiv.style.transform = 'translateY(-2px)';
    itemDiv.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    itemDiv.style.borderColor = '#667eea';
  };
  itemDiv.onmouseout = () => {
    itemDiv.style.transform = 'translateY(0)';
    itemDiv.style.boxShadow = 'none';
    itemDiv.style.borderColor = '#e2e8f0';
  };

  itemDiv.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <img src="../icons/icon16.png" alt="Repo" style="width:18px; height:18px; margin-right: 10px; border-radius: 4px;">
          <a href="${item.url}" target="_blank" style="font-weight: 700; color: var(--modal-title); text-decoration: none; font-size: 12px;">
            ${item.owner}/${item.repo}
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--empty-desc); font-size: 13px; background: var(--summary-bg); padding: 3px 7px; border-radius: 6px; white-space: nowrap; font-weight: bold;">
            ★
          </span>
          <button class="remove-fav-btn" title="Remove from Favorites" style="background: none; color: #ef4444; border: none; padding: 0 4px; border-radius: 6px; font-size: 18px; cursor: pointer; line-height: 1;">🗑️</button>
        </div>
      </div>
    </div>
  `;

  const removeBtn = itemDiv.querySelector('.remove-fav-btn');
  if (removeBtn) {
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      window.removeFavorite(item.url);
    };
  }

  itemDiv.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
    }
  };

  return itemDiv;
}

  window.downloadReport = function(url) {
    chrome.storage.local.get({ analyzedHistory: [] }, (result) => {
      const item = result.analyzedHistory.find(h => h.url === url);
      if (item && item.projectPaper) {
        const blob = new Blob([item.projectPaper], {type: 'text/plain'});
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${item.owner}_${item.repo}_report.txt`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }
    });
  };

  window.toggleFavorite = function(url, owner, repo) {
    chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
      let favorites = result.favoriteRepos || [];
      const existingIndex = favorites.findIndex(f => f.url === url);
      if (existingIndex === -1) {
        favorites.push({ url, owner, repo, timestamp: Date.now() });
      } else {
        favorites.splice(existingIndex, 1);
      }
      chrome.storage.local.set({ favoriteRepos: favorites }, () => {
        if (currentTab === 'favorites') {
          loadHistoryContent();
        }
      });
    });
  };

  window.removeFavorite = function(url) {
    chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
      const favorites = result.favoriteRepos.filter(f => f.url !== url);
      chrome.storage.local.set({ favoriteRepos: favorites }, () => {
        loadHistoryContent();
      });
    });
  };

  if (historyIcon) {
    historyIcon.addEventListener('click', showHistoryOverlay);
  }

  function setLoadingState(loading) {
    const buttonText = summarizeBtn.querySelector('.button-text');
    if (loading) {
      summarizeBtn.disabled = true;
      summarizeBtn.classList.add('loading-button');
      if (buttonText) {
        buttonText.style.opacity = '0';
      }
      if (downloadBtn) {
        downloadBtn.style.display = 'none';
      }
    } else {
      summarizeBtn.disabled = false;
      summarizeBtn.classList.remove('loading-button');
      if (buttonText) {
        buttonText.style.opacity = '1';
      }
    }
  }

  // Enhanced showMessage: supports errorType for more granular feedback
  function showMessage(message, type = 'info', errorType = null) {
    summaryDiv.className = '';
    summaryDiv.classList.add(type);
    let icon = '';
    if (type === 'loading') {
      icon = '⏳';
    } else if (type === 'error') {
      if (errorType === 'network-error') icon = '🌐';
      else if (errorType === 'api-error') icon = '🤖';
      else if (errorType === 'extraction-error') icon = '📦';
      else icon = '⌘';
    } else if (type === 'success') {
      icon = `<img src="../icons/branch.png" alt="View Structure" title="Get Repository Tree" style="width: 16px; height: 16px; cursor: pointer;" class="tree-trigger" onclick="showTreeOverlay()">`;
    } else if (type === 'info') {
      icon = 'ℹ️';
    }
    
    if (type === 'error') {
      summaryDiv.innerHTML = `<span class="status-indicator ${type}">${icon}</span> ${message}`;
    } else {
      summaryDiv.innerHTML = `<span class="status-indicator ${type}">${icon}</span> ${message}`;
      
      // Add click handler for tree trigger if it's a success message
      if (type === 'success') {
        const treeTrigger = summaryDiv.querySelector('.tree-trigger');
        if (treeTrigger) {
          treeTrigger.onclick = showTreeOverlay;
        }
      }
    }
    summaryDiv.style.display = 'block';
  }

  // Fixed showTreeOverlay function with proper overlay management
  function showTreeOverlay() {
    console.log('Showing tree overlay...');
    
    // Get current repo info
    chrome.storage.local.get(['summaryResult'], async (result) => {
      if (result.summaryResult && result.summaryResult.tree_data) {
        console.log('Got tree data from storage');
        
        // Add overlay-open class to hide theme toggle and other icons
        document.body.classList.add('overlay-open');
        
        // Create overlay container with proper z-index
        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'tree-modal-overlay';
        overlayContainer.innerHTML = `
          <div class="tree-modal">
            <div class="tree-modal-header">
              <h2 class="tree-modal-title">Repository Structure</h2>
              <button class="tree-modal-close" aria-label="Close">✕</button>
            </div>
            <div class="tree-modal-content">
              ${buildTreeHtml(result.summaryResult.tree_data)}
            </div>
          </div>
        `;

        // Add close functionality
        const closeModal = () => {
          overlayContainer.style.animation = 'fadeOut 0.2s ease-out';
          const modal = overlayContainer.querySelector('.tree-modal');
          modal.style.animation = 'modalSlideDown 0.2s ease-out';
          
          setTimeout(() => {
            document.body.removeChild(overlayContainer);
            document.body.classList.remove('overlay-open');
          }, 200);
        };

        const closeBtn = overlayContainer.querySelector('.tree-modal-close');
        closeBtn.onclick = closeModal;
        
        overlayContainer.onclick = (e) => {
          if (e.target === overlayContainer) {
            closeModal();
          }
        };

        // Add folder expansion functionality
        const directories = overlayContainer.querySelectorAll('.directory');
        directories.forEach(dir => {
          if (!dir.classList.contains('no-children')) {
            dir.addEventListener('click', (e) => {
              const li = e.target.closest('li');
              const subtree = li.querySelector('.subtree');
              if (subtree) {
                const isExpanded = subtree.classList.contains('expanded');
                if (!isExpanded) {
                  // Expanding
                  subtree.classList.add('expanded');
                  dir.classList.add('expanded');
                  subtree.style.height = subtree.scrollHeight + 'px';
                } else {
                  // Collapsing
                  subtree.style.height = subtree.scrollHeight + 'px';
                  setTimeout(() => {
                    subtree.style.height = '0';
                  }, 0);
                  subtree.classList.remove('expanded');
                  dir.classList.remove('expanded');
                }
              }
            });
          }
        });

        // Add to body with animation
        document.body.appendChild(overlayContainer);
        
      } else {
        console.error('No tree data found');
        showMessage('Repository structure not available. Please analyze the repository first.', 'error');
      }
    });
  }

  // Tree building function
  function buildTreeHtml(node) {
    if (!node) return '';
    
    let html = '<ul class="repo-tree">';
    
    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        let iconName = 'description';
        let iconClass = 'icon-default';

        switch (ext) {
            // Programming Languages
            case 'js':
                iconName = 'javascript';
                iconClass = 'icon-js';
                break;
            case 'ts':
                iconName = 'code';
                iconClass = 'icon-ts';
                break;
            case 'py':
                iconName = 'code';
                iconClass = 'icon-py';
                break;
            case 'html':
                iconName = 'html';
                iconClass = 'icon-html';
                break;
            case 'css':
                iconName = 'css';
                iconClass = 'icon-css';
                break;
            case 'json':
                iconName = 'data_object';
                iconClass = 'icon-json';
                break;
            case 'md':
                iconName = 'article';
                iconClass = 'icon-md';
                break;
            
            // Images
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
            case 'ico':
                iconName = 'image';
                iconClass = 'icon-img';
                break;
            
            // Config files
            case 'yml':
            case 'yaml':
            case 'toml':
            case 'ini':
            case 'env':
            case 'config':
                iconName = 'settings';
                iconClass = 'icon-config';
                break;
            
            // Git files
            case 'gitignore':
            case 'gitattributes':
                iconName = 'source_control';
                iconClass = 'icon-git';
                break;
            
            // Lock files
            case 'lock':
                iconName = 'lock';
                iconClass = 'icon-lock';
                break;
            
            default:
                if (filename.startsWith('.')) {
                    iconName = 'settings_system_daydream';
                    iconClass = 'icon-config';
                }
        }

        return `<i class="material-icons ${iconClass}">${iconName}</i>`;
    }

    function renderNode(node) {
        const isDirectory = node.type === 'directory';
        const icon = isDirectory ? 
            '<i class="material-icons">folder</i>' : 
            getFileIcon(node.name);
        const hasChildren = node.children && node.children.length > 0;
        
        let nodeHtml = `
            <li>
                <span class="${isDirectory ? 'directory' : 'file'} ${hasChildren ? '' : 'no-children'}" title="${node.name}">
                    ${icon} ${node.name}
                </span>
        `;
        
        if (hasChildren) {
            nodeHtml += '<ul class="subtree">';
            // Sort directories first, then files
            const sortedChildren = [...node.children].sort((a, b) => {
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                }
                return a.type === 'directory' ? -1 : 1;
            });
            sortedChildren.forEach(child => {
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

  // New function for GitHub-specific error with better styling
  function showGitHubError() {
    summaryDiv.className = 'error';
    summaryDiv.innerHTML = `
      <div class="error-content">
        <div class="error-icon">🔗</div>
        <div class="error-text">
          <h3 class="error-title">GitHub Repository Required</h3>
          <p class="error-description">Please navigate to a GitHub repository page to use this extension.</p>
          <div class="error-actions">
            <button class="error-action-btn">🌐 Go to GitHub</button>
          </div>
        </div>
      </div>
    `;
    summaryDiv.style.display = 'block';
    
    // Add event listener to the button
    const goToGitHubBtn = summaryDiv.querySelector('.error-action-btn');
    if (goToGitHubBtn) {
      goToGitHubBtn.addEventListener('click', openGitHub);
    }
  }

  // Helper functions for error actions
  function openGitHub() {
    chrome.tabs.create({ url: 'https://github.com' });
  }

  function showGitHubHelp() {
    summaryDiv.innerHTML = `
      <div class="error-content">
        <div class="error-icon">❓</div>
        <div class="error-text">
          <h3 class="error-title">How to use Repo Summarizer</h3>
          <p class="error-description">
            1. Navigate to any GitHub repository page (e.g., github.com/username/repo)<br>
            2. Click the "Analyze Repository" button<br>
            3. Wait for the AI to analyze the code and generate a summary<br>
            4. Download the detailed project report if needed
          </p>
          <div class="error-actions">
            <button class="error-action-btn">🌐 Go to GitHub</button>
            <button class="error-action-btn secondary">← Back</button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners to the buttons
    const goToGitHubBtn = summaryDiv.querySelector('.error-action-btn');
    const backBtn = summaryDiv.querySelector('.error-action-btn.secondary');
    
    if (goToGitHubBtn) {
      goToGitHubBtn.addEventListener('click', openGitHub);
    }
    if (backBtn) {
      backBtn.addEventListener('click', showGitHubError);
    }
  }

  function showTimeoutError() {
    summaryDiv.className = 'error';
    summaryDiv.innerHTML = `
      <div class="error-content">
        <div class="error-icon">Ⰰ</div>
        <div class="error-text">
          <h3 class="error-title">Extraction Timed Out</h3>
          <p class="error-description">The repository analysis took too long. This often happens with large repositories. Please ensure the page is fully loaded and try again.</p>
          <div class="error-actions">
            <button class="error-action-btn">🔄 Retry Analysis</button>
            <button class="error-action-btn secondary">← Back</button>
          </div>
        </div>
      </div>
    `;
    summaryDiv.style.display = 'block';
    
    // Add event listeners to the buttons
    const retryBtn = summaryDiv.querySelector('.error-action-btn');
    const backBtn = summaryDiv.querySelector('.error-action-btn.secondary');
    
    if (retryBtn) {
      retryBtn.addEventListener('click', retryExtraction);
    }
    if (backBtn) {
      backBtn.addEventListener('click', showGitHubError);
    }
  }

  function retryExtraction() {
    summarizeBtn.click();
  }

  function formatTimestamp(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  downloadBtn.style.opacity = '0';
  downloadBtn.style.transform = 'translateY(10px)';
  downloadBtn.style.transition = 'all 0.3s ease';

  // Ensure consistent styling on revisit
  chrome.storage.local.get('summaryStatus', (res) => {
    if (res.summaryStatus === 'done') {
      const downloadBtn = document.getElementById('downloadBtn');
      if (downloadBtn) {
        downloadBtn.style.background = '#10b981';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
      }
    }
  });
});

// Make showTreeOverlay globally available
window.showTreeOverlay = function() {
  const event = new CustomEvent('showTreeOverlay');
  document.dispatchEvent(event);
};