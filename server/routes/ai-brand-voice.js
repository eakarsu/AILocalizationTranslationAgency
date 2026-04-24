const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, brandGuidelines, language, contentType, brandExamples } = req.body;
    const systemPrompt = `You are a brand voice consistency analyst.
Evaluate text against brand guidelines and suggest improvements for consistency.
Respond with JSON: { "overallConsistencyScore": 0-100, "categories": {"tone": 0-100, "vocabulary": 0-100, "personality": 0-100, "messaging": 0-100}, "violations": [{"segment": "...", "issue": "...", "guideline": "...", "suggestion": "...", "severity": "high|medium|low"}], "onBrandHighlights": ["..."], "revisedText": "...", "recommendations": ["..."] }`;

    const prompt = `Analyze this text for brand voice consistency.
Brand guidelines: ${brandGuidelines || 'not provided'}
Language: ${language || 'English'}
Content type: ${contentType || 'general'}
Brand examples: ${brandExamples || 'not provided'}

Text:
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
    return { overallConsistencyScore: 0, categories: { tone: 0, vocabulary: 0, personality: 0, messaging: 0 }, violations: [], onBrandHighlights: [], revisedText: text, recommendations: [] };
  } catch {
    return { overallConsistencyScore: 0, categories: { tone: 0, vocabulary: 0, personality: 0, messaging: 0 }, violations: [], onBrandHighlights: [], revisedText: text, recommendations: [] };
  }
}

module.exports = router;
