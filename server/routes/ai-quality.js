const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { sourceText, translatedText, sourceLanguage, targetLanguage, qualityFramework } = req.body;
    const systemPrompt = `You are a translation quality assessment expert using the MQM (Multidimensional Quality Metrics) framework.
Evaluate translation quality across accuracy, fluency, terminology, style, and locale conventions.
Respond with JSON: { "overallScore": 92, "categories": {"accuracy": 95, "fluency": 90, "terminology": 88, "style": 93, "localeConventions": 91}, "issues": [{"category": "...", "severity": "critical|major|minor", "source": "...", "target": "...", "suggestion": "...", "explanation": "..."}], "verdict": "...", "recommendations": ["..."] }`;

    const prompt = `Assess the quality of this translation.
Framework: ${qualityFramework || 'MQM'}
${sourceLanguage || 'English'} → ${targetLanguage || 'Spanish'}

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
    return { overallScore: 0, categories: {}, issues: [], verdict: text, recommendations: [] };
  } catch {
    return { overallScore: 0, categories: {}, issues: [], verdict: text, recommendations: [] };
  }
}

module.exports = router;
