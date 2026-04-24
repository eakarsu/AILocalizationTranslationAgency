const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage, tone, domain } = req.body;
    const systemPrompt = `You are an expert translator specializing in ${domain || 'general'} content.
Translate text accurately while maintaining the original meaning, tone, and cultural nuances.
Respond with a JSON object: { "translation": "...", "alternatives": ["..."], "notes": "...", "confidence": 0.95 }`;

    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.
${tone ? `Desired tone: ${tone}` : ''}
${domain ? `Domain: ${domain}` : ''}

Text to translate:
"""
${text}
"""`;

    const result = await callOpenRouter(prompt, systemPrompt);
    res.json({ success: true, result: parseAIResponse(result) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseAIResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { translation: text, alternatives: [], notes: '', confidence: 0.8 };
  } catch {
    return { translation: text, alternatives: [], notes: '', confidence: 0.8 };
  }
}

module.exports = router;
