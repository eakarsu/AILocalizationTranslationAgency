const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { referenceText, sourceLanguage, targetLanguage, domain, existingTerms } = req.body;
    const systemPrompt = `You are a terminologist and lexicographer specializing in translation glossaries.
Extract and define key terms from reference text to build a bilingual glossary.
Respond with JSON: { "glossaryEntries": [{"term": "...", "translation": "...", "definition": "...", "partOfSpeech": "noun|verb|adj|adv|other", "domain": "...", "context": "...", "needsApproval": true/false}], "ambiguousTerms": ["..."], "domainCoverage": "...", "totalTerms": 0, "recommendations": ["..."] }`;

    const prompt = `Generate a bilingual glossary from this reference text.
Source language: ${sourceLanguage || 'English'}
Target language: ${targetLanguage || 'Spanish'}
Domain: ${domain || 'general'}
Existing terms to consider: ${JSON.stringify(existingTerms) || 'none'}

Reference text:
"""
${referenceText}
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
    return { glossaryEntries: [], ambiguousTerms: [], domainCoverage: text, totalTerms: 0, recommendations: [] };
  } catch {
    return { glossaryEntries: [], ambiguousTerms: [], domainCoverage: text, totalTerms: 0, recommendations: [] };
  }
}

module.exports = router;
