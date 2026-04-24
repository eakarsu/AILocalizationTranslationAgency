const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { yourContent, competitorContent, language, market, industry } = req.body;
    const systemPrompt = `You are a competitive localization analyst.
Compare localized content against competitor content and identify strengths, weaknesses, and opportunities.
Respond with JSON: { "overallComparison": {"yourScore": 0-100, "competitorScore": 0-100}, "categories": {"quality": {"yours": 0, "competitor": 0}, "naturalness": {"yours": 0, "competitor": 0}, "seo": {"yours": 0, "competitor": 0}, "engagement": {"yours": 0, "competitor": 0}}, "competitorStrengths": ["..."], "yourStrengths": ["..."], "gaps": ["..."], "keywordComparison": [{"keyword": "...", "yours": true/false, "competitor": true/false}], "actionItems": ["..."] }`;

    const prompt = `Compare our localized content against competitor content.
Language: ${language || 'English'}
Market: ${market || 'general'}
Industry: ${industry || 'general'}

Your content:
"""
${yourContent}
"""

Competitor content:
"""
${competitorContent}
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
    return { overallComparison: { yourScore: 0, competitorScore: 0 }, categories: {}, competitorStrengths: [], yourStrengths: [], gaps: [], keywordComparison: [], actionItems: [] };
  } catch {
    return { overallComparison: { yourScore: 0, competitorScore: 0 }, categories: {}, competitorStrengths: [], yourStrengths: [], gaps: [], keywordComparison: [], actionItems: [] };
  }
}

module.exports = router;
