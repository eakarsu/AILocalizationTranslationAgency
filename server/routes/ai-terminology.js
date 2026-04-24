const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, domain, sourceLanguage, targetLanguage } = req.body;
    const systemPrompt = `You are a terminology management expert for the localization industry.
Extract and suggest terminology from text, providing translations and context.
Respond with JSON: { "terms": [{"term": "...", "definition": "...", "translation": "...", "domain": "...", "context": "...", "alternatives": ["..."]}], "domainAnalysis": "...", "consistencyNotes": "..." }`;

    const prompt = `Extract key terminology from this ${domain || 'general'} text.
Source language: ${sourceLanguage || 'English'}
Target language: ${targetLanguage || 'Spanish'}

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
    return { terms: [], domainAnalysis: text, consistencyNotes: '' };
  } catch {
    return { terms: [], domainAnalysis: text, consistencyNotes: '' };
  }
}

module.exports = router;
