const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { sourceText, translatedText, sourceLanguage, targetLanguage, comparisonType } = req.body;
    const systemPrompt = `You are a translation document comparison specialist.
Compare source and translated documents to identify discrepancies and quality issues.
Respond with JSON: { "matchScore": 0-100, "untranslatedSegments": ["..."], "missingContent": ["..."], "addedContent": ["..."], "structuralDifferences": ["..."], "numberFormatIssues": ["..."], "terminologyInconsistencies": ["..."], "summary": "...", "recommendations": ["..."] }`;

    const prompt = `Compare the source and translated documents.
Source language: ${sourceLanguage || 'English'}
Target language: ${targetLanguage || 'Spanish'}
Comparison type: ${comparisonType || 'full'}

Source text:
"""
${sourceText}
"""

Translated text:
"""
${translatedText}
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
    return { matchScore: 0, untranslatedSegments: [], missingContent: [], addedContent: [], structuralDifferences: [], numberFormatIssues: [], terminologyInconsistencies: [], summary: text, recommendations: [] };
  } catch {
    return { matchScore: 0, untranslatedSegments: [], missingContent: [], addedContent: [], structuralDifferences: [], numberFormatIssues: [], terminologyInconsistencies: [], summary: text, recommendations: [] };
  }
}

module.exports = router;
