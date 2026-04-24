const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, targetLength, language, summaryType, focusAreas } = req.body;
    const systemPrompt = `You are a multilingual content summarization expert.
Summarize content while preserving key information and terminology.
Respond with JSON: { "summary": "...", "bulletPoints": ["..."], "keyTopics": ["..."], "namedEntities": [{"entity": "...", "type": "person|org|place|other", "count": 0}], "keyTerminology": ["..."], "wordCount": {"original": 0, "summary": 0}, "compressionRatio": 0, "translationNotes": "..." }`;

    const prompt = `Summarize the following text.
Target length: ${targetLength || '25% of original'}
Language: ${language || 'English'}
Summary type: ${summaryType || 'concise'}
Focus areas: ${focusAreas || 'all key points'}

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
    return { summary: text, bulletPoints: [], keyTopics: [], namedEntities: [], keyTerminology: [], wordCount: { original: 0, summary: 0 }, compressionRatio: 0, translationNotes: '' };
  } catch {
    return { summary: text, bulletPoints: [], keyTopics: [], namedEntities: [], keyTerminology: [], wordCount: { original: 0, summary: 0 }, compressionRatio: 0, translationNotes: '' };
  }
}

module.exports = router;
