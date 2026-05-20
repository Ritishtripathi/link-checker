// URL Analyzer Module - Optimized Version

class URLAnalyzer {
    constructor() {
        // Compile all patterns once
        this.signals = [
            { name: 'suspicious_tld', weight: 15, pattern: /\.(xyz|top|club|loan|gq|ml|cf|tk|work|click|date|download|review|trade|webcam|win|bid|science|racing|accountant|faith|party|country|stream|ovh|men|loan|date|science|racing|accountant)$/i },
            { name: 'ip_address_url', weight: 20, pattern: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/ },
            { name: 'url_shortener', weight: 12, pattern: /(bit\.ly|tinyurl|goo\.gl|ow\.ly|is\.gd|buff\.ly|adf\.ly|short\.link|rb\.gy|shorte\.st|tiny\.cc|clck\.ru|bc\.vc|t\.co|lnkd\.in)/i },
            { name: 'suspicious_keywords', weight: 18, pattern: /(secure|login|signin|verify|account|update|confirm|banking|payment|alert|suspicious|unusual|activity|blocked|limited|suspended)/i },
            { name: 'https_missing', weight: 15, pattern: /^http:\/\// },
            { name: 'brand_impersonation', weight: 25, pattern: /(paypal|google|microsoft|apple|amazon|facebook|instagram|whatsapp|netflix|spotify|bank|sbi|hdfc|icici|axis|citibank|paytm|phonepe)/i }
        ];
        
        this.severityMap = {
            safe: { color: '#10b981', icon: 'bi-shield-check', verdict: 'SAFE' },
            suspicious: { color: '#f59e0b', icon: 'bi-exclamation-triangle', verdict: 'SUSPICIOUS' },
            phishing: { color: '#ef4444', icon: 'bi-shield-exclamation', verdict: 'PHISHING' }
        };
    }

    analyze(url) {
        if (!url || url.trim() === '') {
            return { score: 0, severity: 'safe', verdict: 'No URL provided', signals: [], details: {} };
        }

        let totalScore = 0;
        const triggeredSignals = [];
        const normalizedUrl = url.trim().toLowerCase();
        
        // Check signals efficiently
        for (const signal of this.signals) {
            if (signal.pattern.test(normalizedUrl)) {
                totalScore += signal.weight;
                triggeredSignals.push({
                    name: signal.name,
                    weight: signal.weight,
                    description: this.getDescription(signal.name)
                });
            }
        }
        
        // Check brand impersonation in domain (optimized)
        const domainMatch = normalizedUrl.match(/https?:\/\/([^\/]+)/);
        if (domainMatch) {
            const domain = domainMatch[1];
            const brands = ['paypal', 'google', 'microsoft', 'apple', 'amazon', 'facebook', 'sbi', 'hdfc', 'icici'];
            for (const brand of brands) {
                if (domain.includes(brand) && !domain.endsWith(`${brand}.com`) && !domain.endsWith(`${brand}.in`)) {
                    if (!triggeredSignals.some(s => s.name === 'brand_impersonation')) {
                        totalScore += 25;
                        triggeredSignals.push({
                            name: 'brand_impersonation',
                            weight: 25,
                            description: `Brand impersonation: ${brand}`
                        });
                    }
                    break;
                }
            }
        }
        
        // Determine severity
        let severity = 'safe';
        if (totalScore >= 50) severity = 'phishing';
        else if (totalScore >= 25) severity = 'suspicious';
        
        return {
            score: Math.min(totalScore, 100),
            severity: severity,
            verdict: this.getVerdict(severity),
            signals: triggeredSignals,
            details: { url: url, signalCount: triggeredSignals.length }
        };
    }
    
    getDescription(name) {
        const descriptions = {
            suspicious_tld: 'Suspicious top-level domain',
            ip_address_url: 'IP address used instead of domain',
            url_shortener: 'URL shortener detected',
            suspicious_keywords: 'Suspicious keywords found',
            https_missing: 'Missing HTTPS encryption',
            brand_impersonation: 'Brand impersonation attempt'
        };
        return descriptions[name] || name;
    }
    
    getVerdict(severity) {
        if (severity === 'phishing') return '⚠️ PHISHING DETECTED - Do not click!';
        if (severity === 'suspicious') return '⚠️ SUSPICIOUS - Exercise caution';
        return '✅ SAFE - No threats detected';
    }
    
    getFormattedResult(url, analysis) {
        const severityData = this.severityMap[analysis.severity];
        
        return {
            html: `
                <div class="result-header" style="border-left-color: ${severityData.color}; padding: 16px; display: flex; align-items: center; gap: 16px;">
                    <div class="result-icon" style="color: ${severityData.color}; font-size: 32px;">
                        <i class="bi ${severityData.icon}"></i>
                    </div>
                    <div class="result-verdict" style="flex: 1;">
                        <span class="verdict-text" style="color: ${severityData.color}; font-weight: bold; font-size: 16px; display: block;">${analysis.verdict}</span>
                        <span class="score-badge" style="font-size: 11px;">Risk Score: ${analysis.score}/100</span>
                    </div>
                </div>
                <div class="result-details" style="padding: 16px;">
                    <div style="display: flex; gap: 8px; padding: 8px 0;">
                        <i class="bi bi-link-45deg"></i>
                        <strong>URL:</strong>
                        <span style="word-break: break-all;">${this.escapeHtml(url)}</span>
                    </div>
                </div>
                ${analysis.signals.length > 0 ? `
                <div style="padding: 16px; background: rgba(0,0,0,0.02); margin: 16px; border-radius: 8px;">
                    <strong><i class="bi bi-exclamation-triangle"></i> Detected (${analysis.signals.length}):</strong>
                    <ul style="margin-top: 8px; list-style: none;">
                        ${analysis.signals.map(s => `<li style="padding: 4px 0;">⚠️ ${this.escapeHtml(s.description)} (+${s.weight})</li>`).join('')}
                    </ul>
                </div>
                ` : '<div style="padding: 16px; text-align: center; color: #10b981;"><i class="bi bi-check-circle"></i> No suspicious patterns detected</div>'}
                <div style="padding: 12px; background: rgba(0,0,0,0.03); font-size: 11px; color: #6b7280; text-align: center;">
                    <i class="bi bi-info-circle"></i> Heuristic analysis only. Always verify through official channels.
                </div>
            `,
            severity: analysis.severity
        };
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const urlAnalyzer = new URLAnalyzer();