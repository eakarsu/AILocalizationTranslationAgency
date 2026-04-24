const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, language, styleGuide } = req.body;
    const systemPrompt = `You are a professional editor and proofreader.
Check grammar, spelling, punctuation, style, and clarity.
Respond with JSON: { "correctedText": "...", "issues": [{"type": "grammar|spelling|style|punctuation", "original": "...", "suggestion": "...", "explanation": "..."}], "overallScore": 85, "readabilityLevel": "...", "suggestions": ["..."] }`;

    const prompt = `Check and correct the following ${language || 'English'} text.
${styleGuide ? `Style guide: ${styleGuide}` : ''}

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
    return { correctedText: text, issues: [], overallScore: 0, readabilityLevel: 'N/A', suggestions: [] };
  } catch {
    return { correctedText: text, issues: [], overallScore: 0, readabilityLevel: 'N/A', suggestions: [] };
  }
}

module.exports = router;
