const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { projectRequirements, sourceLanguage, targetLanguage, domain, availableTranslators, deadline, qualityTier } = req.body;
    const systemPrompt = `You are a resource allocation specialist for translation services.
Match translators to projects based on skills, availability, and project requirements.
Respond with JSON: { "rankedCandidates": [{"rank": 1, "name": "...", "matchScore": 0-100, "strengths": ["..."], "concerns": ["..."]}], "teamRecommendation": "...", "workloadAnalysis": "...", "riskFactors": ["..."], "recommendations": ["..."] }`;

    const prompt = `Match translators to this project.
Project requirements: ${projectRequirements || 'not provided'}
Source language: ${sourceLanguage || 'English'}
Target language: ${targetLanguage || 'not specified'}
Domain: ${domain || 'general'}
Available translators: ${JSON.stringify(availableTranslators) || 'not provided'}
Deadline: ${deadline || 'flexible'}
Quality tier: ${qualityTier || 'standard'}`;

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
    return { rankedCandidates: [], teamRecommendation: text, workloadAnalysis: '', riskFactors: [], recommendations: [] };
  } catch {
    return { rankedCandidates: [], teamRecommendation: text, workloadAnalysis: '', riskFactors: [], recommendations: [] };
  }
}

module.exports = router;
