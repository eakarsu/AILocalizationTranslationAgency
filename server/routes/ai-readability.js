const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, language, targetAudience, targetReadingLevel } = req.body;
    const systemPrompt = `You are a readability and plain language specialist.
Analyze text readability and provide simplification suggestions.
Respond with JSON: { "readabilityScore": 0-100, "gradeLevel": "...", "cefrLevel": "A1|A2|B1|B2|C1|C2", "avgSentenceLength": 0, "avgWordLength": 0, "complexWordPercentage": 0, "passiveVoicePercentage": 0, "jargonTerms": [{"term": "...", "simpleAlternative": "..."}], "simplifiedVersion": "...", "meetsTarget": true/false, "recommendations": ["..."] }`;

    const prompt = `Analyze the readability of this text.
Language: ${language || 'English'}
Target audience: ${targetAudience || 'general public'}
Target reading level: ${targetReadingLevel || 'grade 8'}

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
    return { readabilityScore: 0, gradeLevel: '', cefrLevel: '', avgSentenceLength: 0, avgWordLength: 0, complexWordPercentage: 0, passiveVoicePercentage: 0, jargonTerms: [], simplifiedVersion: text, meetsTarget: false, recommendations: [] };
  } catch {
    return { readabilityScore: 0, gradeLevel: '', cefrLevel: '', avgSentenceLength: 0, avgWordLength: 0, complexWordPercentage: 0, passiveVoicePercentage: 0, jargonTerms: [], simplifiedVersion: text, meetsTarget: false, recommendations: [] };
  }
}

module.exports = router;
