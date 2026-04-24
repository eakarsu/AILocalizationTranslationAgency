const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, sourceculture, targetCulture, contentType } = req.body;
    const systemPrompt = `You are a cultural adaptation and sensitivity expert for global content.
Analyze content for cultural appropriateness and suggest adaptations for the target culture.
Respond with JSON: { "adaptedContent": "...", "culturalIssues": [{"issue": "...", "severity": "high|medium|low", "explanation": "...", "suggestion": "..."}], "colorSymbolism": "...", "taboos": ["..."], "opportunities": ["..."], "overallRisk": "low|medium|high" }`;

    const prompt = `Analyze and adapt this content for cultural appropriateness.
Source culture: ${sourceculture || 'US/Western'}
Target culture: ${targetCulture || 'Japanese'}
Content type: ${contentType || 'marketing'}

Content:
"""
${text}
"""`;

    const result = await callOpenRouter(prompt, systemPrompt);
    res.json({ success: true, result: parseJSON(result) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseJSON(text) {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    return { adaptedContent: text, culturalIssues: [], colorSymbolism: '', taboos: [], opportunities: [], overallRisk: 'unknown' };
  } catch {
    return { adaptedContent: text, culturalIssues: [], colorSymbolism: '', taboos: [], opportunities: [], overallRisk: 'unknown' };
  }
}

module.exports = router;
