const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { sourceText, translatedText, sourceLanguage, targetLanguage } = req.body;
    const systemPrompt = `You are a multilingual sentiment analysis specialist.
Analyze sentiment in both source and translated texts and identify any emotional drift.
Respond with JSON: { "sourceSentiment": {"polarity": "positive|negative|neutral|mixed", "score": -1.0 to 1.0, "emotions": ["..."], "intensity": "strong|moderate|mild"}, "targetSentiment": {"polarity": "...", "score": 0, "emotions": ["..."], "intensity": "..."}, "sentimentMatch": true/false, "drifts": [{"segment": "...", "sourceEmotion": "...", "targetEmotion": "...", "suggestion": "..."}], "overallAnalysis": "...", "recommendations": ["..."] }`;

    const prompt = `Analyze sentiment in both source and translated texts.
Source language: ${sourceLanguage || 'English'}
Target language: ${targetLanguage || 'Spanish'}

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
    return { sourceSentiment: {}, targetSentiment: {}, sentimentMatch: false, drifts: [], overallAnalysis: text, recommendations: [] };
  } catch {
    return { sourceSentiment: {}, targetSentiment: {}, sentimentMatch: false, drifts: [], overallAnalysis: text, recommendations: [] };
  }
}

module.exports = router;
