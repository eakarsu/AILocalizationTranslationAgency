const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { sourceText, translatedText, sourceLanguage, targetLanguage, domain } = req.body;
    const systemPrompt = `You are a back-translation verification specialist.
Translate the provided translated text back into the source language and analyze fidelity.
Respond with JSON: { "backTranslation": "...", "fidelityScore": 0-100, "meaningDrifts": [{"original": "...", "translated": "...", "backTranslated": "...", "severity": "high|medium|low", "explanation": "..."}], "omissions": ["..."], "additions": ["..."], "verdict": "pass|review|fail", "recommendations": ["..."] }`;

    const prompt = `Perform back-translation verification.
Source language: ${sourceLanguage || 'English'}
Target language: ${targetLanguage || 'Spanish'}
Domain: ${domain || 'general'}

Original source text:
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
    return { backTranslation: text, fidelityScore: 0, meaningDrifts: [], omissions: [], additions: [], verdict: 'unknown', recommendations: [] };
  } catch {
    return { backTranslation: text, fidelityScore: 0, meaningDrifts: [], omissions: [], additions: [], verdict: 'unknown', recommendations: [] };
  }
}

module.exports = router;
