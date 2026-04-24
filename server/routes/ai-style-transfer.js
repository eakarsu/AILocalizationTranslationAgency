const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, sourceStyle, targetStyle, language, brandVoice } = req.body;
    const systemPrompt = `You are a style transfer specialist.
Transform text from one writing style to another while preserving meaning.
Respond with JSON: { "transformedText": "...", "styleChanges": [{"original": "...", "changed": "...", "changeType": "...", "reason": "..."}], "preservedMeaning": true/false, "styleScore": 0-100, "toneAnalysis": "...", "notes": "..." }`;

    const prompt = `Transform the writing style of this text.
Source style: ${sourceStyle || 'formal'}
Target style: ${targetStyle || 'casual'}
Language: ${language || 'English'}
Brand voice: ${brandVoice || 'not specified'}

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
    return { transformedText: text, styleChanges: [], preservedMeaning: false, styleScore: 0, toneAnalysis: '', notes: '' };
  } catch {
    return { transformedText: text, styleChanges: [], preservedMeaning: false, styleScore: 0, toneAnalysis: '', notes: '' };
  }
}

module.exports = router;
