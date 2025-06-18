document.addEventListener('DOMContentLoaded', function() {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const summaryDiv = document.getElementById('summary');
  
  let projectPaper = '';

  // Check if we're on a GitHub page on load
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentUrl = tabs[0].url;
    if (!currentUrl.includes('github.com')) {
      showMessage('Please navigate to a GitHub repository page to use this extension.', 'error');
      summarizeBtn.disabled = true;
    }
  });

  summarizeBtn.addEventListener('click', async () => {
    try {
      // Start loading state
      setLoadingState(true);
      showMessage('🔍 Extracting repository information...', 'loading');
      
      chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        try {
          // Extract repo info
          chrome.tabs.sendMessage(tabs[0].id, {action: 'extractRepoInfo'}, async (repoInfo) => {
            if (!repoInfo) {
              setLoadingState(false);
              showMessage('❌ Could not extract repository information. Please make sure you\'re on a GitHub repository page.', 'error');
              return;
            }

            showMessage('🤖 Generating AI summary...', 'loading');

            try {
              // Call the backend API
              const response = await fetch('http://localhost:8000/summarize', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(repoInfo)
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              
              if (data.error) {
                throw new Error(data.error);
              }

              // Success
              setLoadingState(false);
              showMessage(data.summary, 'success');
              projectPaper = data.project_paper;
              downloadBtn.style.display = 'block';
              
              // Animate download button appearance
              setTimeout(() => {
                downloadBtn.style.opacity = '1';
                downloadBtn.style.transform = 'translateY(0)';
              }, 100);

            } catch (fetchError) {
              setLoadingState(false);
              showMessage(`❌ Error generating summary: ${fetchError.message}. Please make sure the backend server is running on localhost:8000.`, 'error');
            }
          });
        } catch (tabError) {
          setLoadingState(false);
          showMessage('❌ Error accessing the current tab. Please refresh the page and try again.', 'error');
        }
      });
    } catch (error) {
      setLoadingState(false);
      showMessage(`❌ Unexpected error: ${error.message}`, 'error');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!projectPaper) {
      showMessage('❌ No project report available to download.', 'error');
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
      
      // Visual feedback
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '✅ Downloaded!';
      downloadBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
      
      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.style.background = '';
      }, 2000);
      
    } catch (error) {
      showMessage(`❌ Error downloading file: ${error.message}`, 'error');
    }
  });

  function setLoadingState(loading) {
    const buttonText = summarizeBtn.querySelector('.button-text');
    
    if (loading) {
      summarizeBtn.disabled = true;
      summarizeBtn.classList.add('loading-button');
      buttonText.style.opacity = '0';
      downloadBtn.style.display = 'none';
    } else {
      summarizeBtn.disabled = false;
      summarizeBtn.classList.remove('loading-button');
      buttonText.style.opacity = '1';
    }
  }

  function showMessage(message, type = 'info') {
    summaryDiv.className = ''; // Reset classes
    summaryDiv.classList.add(type);
    summaryDiv.textContent = message;
    summaryDiv.style.display = 'block';
    
    // Add status indicator for loading
    if (type === 'loading') {
      const indicator = document.createElement('span');
      indicator.className = 'status-indicator active';
      summaryDiv.prepend(indicator);
    } else if (type === 'error') {
      const indicator = document.createElement('span');
      indicator.className = 'status-indicator error';
      summaryDiv.prepend(indicator);
    }
  }

  // Initialize download button styling
  downloadBtn.style.opacity = '0';
  downloadBtn.style.transform = 'translateY(10px)';
  downloadBtn.style.transition = 'all 0.3s ease';
});