// SMS Analyzer Module - Optimized Version

class SMSAnalyzer {
    constructor() {
        // Simplified patterns for better performance
        this.patterns = [
            { name: 'urgency', weight: 20, pattern: /\b(urgent|immediate|asap|quick|now|today|expires|deadline|last chance|warning|alert)\b/gi },
            { name: 'account_threat', weight: 25, pattern: /\b(blocked|suspended|locked|compromised|hacked|breach|unauthorized|restricted|terminated)\b/gi },
            { name: 'financial', weight: 15, pattern: /\b(bank|account|payment|transaction|refund|credit|debit|card|upi|gpay|phonepe|paytm|wallet|balance)\b/gi },
            { name: 'reward', weight: 18, pattern: /\b(win|prize|reward|cashback|gift|free|lottery|jackpot|bonus|offer)\b/gi },
            { name: 'links', weight: 15, pattern: /(bit\.ly|tinyurl|goo\.gl|ow\.ly|is\.gd|t\.co|http:\/\/[a-z0-9]{5,}\.[a-z]{2,})/gi },
            { name: 'info_request', weight: 30, pattern: /\b(verify|confirm|update|login|click|provide|send|share|reply)\b.*\b(details|password|otp|pin|security|account)\b/gi },
            { name: 'impersonation', weight: 28, pattern: /\b(sbi|hdfc|icici|axis|paytm|phonepe|amazon|flipkart|google|paypal)\b/gi }
        ];
        
        this.severityMap = {
            safe: { color: '#10b981', icon: 'bi-shield-check', verdict: 'SAFE MESSAGE' },
            suspicious: { color: '#f59e0b', icon: 'bi-exclamation-triangle', verdict: 'SUSPICIOUS' },
            phishing: { color: '#ef4444', icon: 'bi-shield-exclamation', verdict: 'PHISHING ATTEMPT' }
        };
    }
    
    analyze(message) {
        if (!message || message.trim() === '') {
            return { score: 0, severity: 'safe', verdict: 'No message provided', signals: [], details: {} };
        }
        
        let totalScore = 0;
        const triggeredSignals = [];
        const text = message;
        
        // Check patterns efficiently
        for (const pattern of this.patterns) {
            if (pattern.pattern.test(text)) {
                totalScore += pattern.weight;
                triggeredSignals.push({
                    name: pattern.name,
                    weight: pattern.weight,
                    description: this.getDescription(pattern.name)
                });
            }
        }
        
        // Check for links
        const links = text.match(/https?:\/\/[^\s]+/g);
        if (links && links.length > 0) {
            const linkWeight = Math.min(links.length * 8, 20);
            totalScore += linkWeight;
            triggeredSignals.push({
                name: 'multiple_links',
                weight: linkWeight,
                description: `${links.length} link(s) detected`
            });
        }
        
        // Determine severity
        let severity = 'safe';
        if (totalScore >= 55) severity = 'phishing';
        else if (totalScore >= 25) severity = 'suspicious';
        
        return {
            score: Math.min(Math.round(totalScore), 100),
            severity: severity,
            verdict: this.getVerdict(severity),
            signals: triggeredSignals,
            details: { length: text.length, wordCount: text.split(/\s+/).length, linkCount: links ? links.length : 0 }
        };
    }
    
    getDescription(name) {
        const descriptions = {
            urgency: 'Urgency/pressure tactics',
            account_threat: 'Account threat claims',
            financial: 'Financial terminology',
            reward: 'Reward/prize bait',
            links: 'Shortened/suspicious links',
            info_request: 'Personal info request',
            impersonation: 'Brand impersonation',
            multiple_links: 'Multiple links detected'
        };
        return descriptions[name] || name;
    }
    
    getVerdict(severity) {
        if (severity === 'phishing') return '⚠️ PHISHING ATTEMPT - Do not respond!';
        if (severity === 'suspicious') return '⚠️ SUSPICIOUS - Verify before acting';
        return '✅ SAFE - No scam patterns detected';
    }
    
    getFormattedResult(message, analysis) {
        const severityData = this.severityMap[analysis.severity];
        const displayMsg = message.length > 150 ? message.substring(0, 150) + '...' : message;
        
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
                        <i class="bi bi-chat-text"></i>
                        <strong>Message:</strong>
                        <span>"${this.escapeHtml(displayMsg)}"</span>
                    </div>
                    <div style="display: flex; gap: 16px; padding: 12px 0;">
                        <span><i class="bi bi-text-paragraph"></i> ${analysis.details.wordCount} words</span>
                        <span><i class="bi bi-link"></i> ${analysis.details.linkCount} links</span>
                        <span><i class="bi bi-exclamation-triangle"></i> ${analysis.signals.length} signals</span>
                    </div>
                </div>
                ${analysis.signals.length > 0 ? `
                <div style="padding: 16px; background: rgba(0,0,0,0.02); margin: 16px; border-radius: 8px;">
                    <strong><i class="bi bi-exclamation-triangle"></i> Scam Indicators:</strong>
                    <ul style="margin-top: 8px; list-style: none;">
                        ${analysis.signals.map(s => `<li style="padding: 4px 0;">⚠️ ${this.escapeHtml(s.description)} (+${s.weight})</li>`).join('')}
                    </ul>
                </div>
                ` : '<div style="padding: 16px; text-align: center; color: #10b981;"><i class="bi bi-check-circle"></i> No scam patterns detected</div>'}
                <div style="padding: 12px; background: rgba(0,0,0,0.03); font-size: 11px; color: #6b7280; text-align: center;">
                    <i class="bi bi-shield-check"></i> Never share OTPs, passwords, or personal information via SMS.
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

const smsAnalyzer = new SMSAnalyzer();