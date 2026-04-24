const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, sourceLocale, targetLocale, contentType, industry } = req.body;
    const systemPrompt = `You are a localization expert who adapts content for different markets.
Go beyond translation — adapt cultural references, idioms, formats (dates, currency, measurements), and tone.
Respond with JSON: { "localizedContent": "...", "adaptations": [{"original": "...", "adapted": "...", "reason": "..."}], "culturalNotes": "...", "marketInsights": "..." }`;

    const prompt = `Localize the following content from ${sourceLocale} to ${targetLocale}.
Content type: ${contentType || 'marketing'}
Industry: ${industry || 'general'}

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
    return { localizedContent: text, adaptations: [], culturalNotes: '', marketInsights: '' };
  } catch {
    return { localizedContent: text, adaptations: [], culturalNotes: '', marketInsights: '' };
  }
}

module.exports = router;
