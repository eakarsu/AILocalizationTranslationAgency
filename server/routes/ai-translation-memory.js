const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { sourceText, previousTranslations, sourceLanguage, targetLanguage } = req.body;
    const systemPrompt = `You are a translation memory system powered by AI.
Analyze source text against previous translations to find matches and suggest reuse.
Respond with JSON: { "segments": [{"source": "...", "suggestedTranslation": "...", "matchType": "exact|fuzzy|no_match", "matchPercentage": 95, "reference": "..."}], "reusePercentage": 45, "estimatedSavings": "$...", "recommendations": ["..."] }`;

    const prompt = `Analyze this text for translation memory matches.
Source: ${sourceLanguage || 'English'} → Target: ${targetLanguage || 'Spanish'}

New text to translate:
"""
${sourceText}
"""

Previous translations database:
"""
${previousTranslations || 'No previous translations available.'}
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
    return { segments: [], reusePercentage: 0, estimatedSavings: '$0', recommendations: [] };
  } catch {
    return { segments: [], reusePercentage: 0, estimatedSavings: '$0', recommendations: [] };
  }
}

module.exports = router;
