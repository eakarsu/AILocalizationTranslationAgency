const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, detectDialect } = req.body;
    const systemPrompt = `You are a language identification expert.
Detect the language, dialect, script, and other linguistic properties of the provided text.
Respond with JSON: { "detectedLanguage": "...", "languageCode": "...", "dialect": "...", "script": "...", "confidence": 0-100, "alternativePossibilities": [{"language": "...", "confidence": 0}], "isMultilingual": true/false, "mixedLanguages": ["..."], "formalityLevel": "formal|informal|neutral", "notes": "..." }`;

    const prompt = `Detect the language of the following text.
Detect dialect: ${detectDialect ? 'Yes, identify specific dialect/variant' : 'No, language-level detection is sufficient'}

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
    return { detectedLanguage: text, languageCode: '', dialect: '', script: '', confidence: 0, alternativePossibilities: [], isMultilingual: false, mixedLanguages: [], formalityLevel: 'unknown', notes: '' };
  } catch {
    return { detectedLanguage: text, languageCode: '', dialect: '', script: '', confidence: 0, alternativePossibilities: [], isMultilingual: false, mixedLanguages: [], formalityLevel: 'unknown', notes: '' };
  }
}

module.exports = router;
