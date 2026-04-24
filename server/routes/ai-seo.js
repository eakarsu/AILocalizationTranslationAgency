const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, keywords, sourceLanguage, targetLanguage, targetMarket } = req.body;
    const systemPrompt = `You are an international SEO and content localization expert.
Optimize content for search engines in the target market while maintaining natural language.
Respond with JSON: { "optimizedContent": "...", "seoTitle": "...", "metaDescription": "...", "localizedKeywords": [{"original": "...", "localized": "...", "searchVolume": "high|medium|low"}], "urlSlug": "...", "hreflangTag": "...", "recommendations": ["..."], "seoScore": 85 }`;

    const prompt = `Optimize this content for SEO in the ${targetMarket || 'global'} market.
${sourceLanguage || 'English'} → ${targetLanguage || 'Spanish'}
${keywords ? `Target keywords: ${keywords}` : ''}

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
    return { optimizedContent: text, seoTitle: '', metaDescription: '', localizedKeywords: [], urlSlug: '', hreflangTag: '', recommendations: [], seoScore: 0 };
  } catch {
    return { optimizedContent: text, seoTitle: '', metaDescription: '', localizedKeywords: [], urlSlug: '', hreflangTag: '', recommendations: [], seoScore: 0 };
  }
}

module.exports = router;
