const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, language, targetAudience, guidelines } = req.body;
    const systemPrompt = `You are a DEI language specialist.
Analyze text for bias, inclusivity issues, and suggest inclusive alternatives.
Respond with JSON: { "inclusivityScore": 0-100, "issues": [{"text": "...", "category": "gender|race|age|disability|cultural|other", "severity": "high|medium|low", "explanation": "...", "inclusiveAlternative": "..."}], "genderAnalysis": "...", "revisedText": "...", "positiveNotes": ["..."], "recommendations": ["..."] }`;

    const prompt = `Analyze this text for bias and inclusivity.
Language: ${language || 'English'}
Target audience: ${targetAudience || 'general public'}
Guidelines: ${guidelines || 'standard DEI best practices'}

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
    return { inclusivityScore: 0, issues: [], genderAnalysis: text, revisedText: '', positiveNotes: [], recommendations: [] };
  } catch {
    return { inclusivityScore: 0, issues: [], genderAnalysis: text, revisedText: '', positiveNotes: [], recommendations: [] };
  }
}

module.exports = router;
