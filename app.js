// Main Application Logic for PhishGuard - Optimized Version

document.addEventListener('DOMContentLoaded', () => {
    
    // ─────────────────────────────────────────────
    // DOM Elements
    // ─────────────────────────────────────────────
    const urlInput = document.getElementById('urlInput');
    const urlCheckBtn = document.getElementById('urlCheckBtn');
    const urlClear = document.getElementById('urlClear');
    const urlResult = document.getElementById('urlResult');
    
    const smsInput = document.getElementById('smsInput');
    const smsCheckBtn = document.getElementById('smsCheckBtn');
    const smsClear = document.getElementById('smsClear');
    const smsResult = document.getElementById('smsResult');
    const smsCharCount = document.getElementById('smsCharCount');
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Example buttons
    const urlChips = document.querySelectorAll('[data-url]');
    const smsChips = document.querySelectorAll('[data-sms]');
    
    // Debounce timers
    let urlAnalysisTimeout = null;
    let smsAnalysisTimeout = null;
    
    // ─────────────────────────────────────────────
    // Tab Switching (Optimized)
    // ─────────────────────────────────────────────
    function switchTab(tabId) {
        // Update tab buttons
        tabBtns.forEach(btn => {
            const target = btn.getAttribute('data-target');
            if (target === tabId) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
        
        // Update panels
        tabPanels.forEach(panel => {
            if (panel.id === `panel-${tabId}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Update navigation pills
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${tabId}-checker`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Focus on active input
        setTimeout(() => {
            if (tabId === 'url') {
                urlInput?.focus();
            } else {
                smsInput?.focus();
            }
        }, 50);
    }
    
    // Tab button click handlers
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-target');
            switchTab(target);
        });
    });
    
    // Navigation pill click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#url-checker') {
                switchTab('url');
            } else if (href === '#sms-checker') {
                switchTab('sms');
            }
        });
    });
    
    // Handle initial hash
    if (window.location.hash === '#sms-checker') {
        switchTab('sms');
    } else {
        switchTab('url');
    }
    
    // ─────────────────────────────────────────────
    // URL Analysis Functions (Optimized)
    // ─────────────────────────────────────────────
    function analyzeURL() {
        // Clear any pending timeout
        if (urlAnalysisTimeout) {
            clearTimeout(urlAnalysisTimeout);
        }
        
        const url = urlInput.value.trim();
        
        if (!url) {
            showError(urlResult, 'Please enter a URL to analyze');
            return;
        }
        
        // Show loading state
        showLoading(urlResult, 'Analyzing URL...');
        
        // Use setTimeout to prevent UI blocking
        urlAnalysisTimeout = setTimeout(() => {
            try {
                const analysis = urlAnalyzer.analyze(url);
                const formatted = urlAnalyzer.getFormattedResult(url, analysis);
                displayResult(urlResult, formatted.html, formatted.severity);
                
                // Log analysis (optional)
                console.log('URL Analysis:', {
                    url: url.substring(0, 50),
                    score: analysis.score,
                    severity: analysis.severity
                });
            } catch (error) {
                console.error('URL Analysis Error:', error);
                showError(urlResult, 'Analysis failed. Please try again.');
            }
            urlAnalysisTimeout = null;
        }, 100);
    }
    
    // ─────────────────────────────────────────────
    // SMS Analysis Functions (Optimized)
    // ─────────────────────────────────────────────
    function analyzeSMS() {
        // Clear any pending timeout
        if (smsAnalysisTimeout) {
            clearTimeout(smsAnalysisTimeout);
        }
        
        const message = smsInput.value.trim();
        
        if (!message) {
            showError(smsResult, 'Please enter an SMS message to analyze');
            return;
        }
        
        if (message.length > 1000) {
            showError(smsResult, 'Message exceeds 1000 characters. Please shorten the message.');
            return;
        }
        
        // Show loading state
        showLoading(smsResult, 'Analyzing message...');
        
        // Use setTimeout to prevent UI blocking
        smsAnalysisTimeout = setTimeout(() => {
            try {
                const analysis = smsAnalyzer.analyze(message);
                const formatted = smsAnalyzer.getFormattedResult(message, analysis);
                displayResult(smsResult, formatted.html, formatted.severity);
                
                // Log analysis (optional)
                console.log('SMS Analysis:', {
                    message: message.substring(0, 50),
                    score: analysis.score,
                    severity: analysis.severity
                });
            } catch (error) {
                console.error('SMS Analysis Error:', error);
                showError(smsResult, 'Analysis failed. Please try again.');
            }
            smsAnalysisTimeout = null;
        }, 100);
    }
    
    // ─────────────────────────────────────────────
    // UI Helper Functions (Optimized)
    // ─────────────────────────────────────────────
    function showLoading(container, message) {
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 40px;">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid rgba(99,102,241,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
                <p style="color: var(--text-secondary);">${escapeHtml(message)}</p>
            </div>
        `;
        
        // Add spin animation if not exists
        if (!document.querySelector('#spin-style')) {
            const style = document.createElement('style');
            style.id = 'spin-style';
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    }
    
    function showError(container, message) {
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 40px; color: #ef4444;">
                <i class="bi bi-exclamation-octagon" style="font-size: 48px; margin-bottom: 16px; display: inline-block;"></i>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    }
    
    function displayResult(container, html, severity) {
        if (!container) return;
        container.innerHTML = html;
        
        // Add severity class for styling
        container.classList.remove('result-safe', 'result-suspicious', 'result-phishing');
        container.classList.add(`result-${severity}`);
        
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Clear URL input
    function clearURL() {
        if (!urlInput) return;
        urlInput.value = '';
        if (urlResult) {
            urlResult.style.display = 'none';
            urlResult.innerHTML = '';
        }
        urlInput.focus();
        if (urlClear) urlClear.style.display = 'none';
    }
    
    // Clear SMS input
    function clearSMS() {
        if (!smsInput) return;
        smsInput.value = '';
        if (smsResult) {
            smsResult.style.display = 'none';
            smsResult.innerHTML = '';
        }
        updateCharCount();
        smsInput.focus();
    }
    
    // Update character counter for SMS
    function updateCharCount() {
        if (!smsInput || !smsCharCount) return;
        const length = smsInput.value.length;
        smsCharCount.textContent = `${length} / 1000`;
        
        if (length > 900) {
            smsCharCount.style.color = '#f59e0b';
        } else if (length > 950) {
            smsCharCount.style.color = '#ef4444';
        } else {
            smsCharCount.style.color = 'var(--text-secondary)';
        }
    }
    
    // Show/hide clear button for URL
    function toggleURLClear() {
        if (!urlClear || !urlInput) return;
        if (urlInput.value.length > 0) {
            urlClear.style.display = 'flex';
        } else {
            urlClear.style.display = 'none';
        }
    }
    
    // ─────────────────────────────────────────────
    // Event Listeners (Optimized)
    // ─────────────────────────────────────────────
    
    // URL check button
    if (urlCheckBtn) {
        urlCheckBtn.addEventListener('click', (e) => {
            e.preventDefault();
            analyzeURL();
        });
    }
    
    // URL enter key
    if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                analyzeURL();
            }
        });
    }
    
    // URL input change (show clear button)
    if (urlInput) {
        urlInput.addEventListener('input', toggleURLClear);
    }
    
    // URL clear button
    if (urlClear) {
        urlClear.addEventListener('click', clearURL);
    }
    
    // SMS check button
    if (smsCheckBtn) {
        smsCheckBtn.addEventListener('click', (e) => {
            e.preventDefault();
            analyzeSMS();
        });
    }
    
    // SMS clear button
    if (smsClear) {
        smsClear.addEventListener('click', clearSMS);
    }
    
    // SMS character counter
    if (smsInput) {
        smsInput.addEventListener('input', () => {
            updateCharCount();
        });
    }
    
    // SMS enter key (Ctrl+Enter for new line, Enter for submit)
    if (smsInput) {
        smsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                analyzeSMS();
            }
        });
    }
    
    // Example URL chips
    if (urlChips.length > 0) {
        urlChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                const url = chip.getAttribute('data-url');
                if (url && urlInput) {
                    urlInput.value = url;
                    toggleURLClear();
                    analyzeURL();
                }
            });
        });
    }
    
    // Example SMS chips
    if (smsChips.length > 0) {
        smsChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                const sms = chip.getAttribute('data-sms');
                if (sms && smsInput) {
                    smsInput.value = sms;
                    updateCharCount();
                    analyzeSMS();
                }
            });
        });
    }
    
    // Tab slider animation (optimized)
    function updateTabSlider() {
        const activeTabBtn = document.querySelector('.tab-btn.active');
        const slider = document.querySelector('.tab-slider');
        if (activeTabBtn && slider) {
            requestAnimationFrame(() => {
                const btnRect = activeTabBtn.getBoundingClientRect();
                const parentRect = activeTabBtn.parentElement?.getBoundingClientRect();
                if (parentRect) {
                    slider.style.width = `${btnRect.width}px`;
                    slider.style.transform = `translateX(${btnRect.left - parentRect.left}px)`;
                }
            });
        }
    }
    
    // Update slider on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateTabSlider, 100);
    });
    
    setTimeout(updateTabSlider, 100);
    
    // Initialize character counter
    updateCharCount();
    
    console.log('PhishGuard initialized successfully');
});