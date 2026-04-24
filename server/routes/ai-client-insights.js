const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { clientProfile, projectHistory, communicationSamples, industry } = req.body;
    const systemPrompt = `You are a client relationship and business intelligence analyst for translation services.
Analyze client data and provide actionable insights for account management.
Respond with JSON: { "clientTier": "enterprise|premium|standard|basic", "satisfactionEstimate": 0-100, "predictedNeeds": ["..."], "upsellOpportunities": ["..."], "churnRisk": "high|medium|low", "languageExpansion": ["..."], "communicationStyle": "...", "recommendations": ["..."] }`;

    const prompt = `Analyze this client profile and provide business insights.
Client profile: ${clientProfile || 'not provided'}
Project history: ${projectHistory || 'not provided'}
Communication samples: ${communicationSamples || 'not provided'}
Industry: ${industry || 'general'}`;

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
    return { clientTier: 'unknown', satisfactionEstimate: 0, predictedNeeds: [], upsellOpportunities: [], churnRisk: 'unknown', languageExpansion: [], communicationStyle: text, recommendations: [] };
  } catch {
    return { clientTier: 'unknown', satisfactionEstimate: 0, predictedNeeds: [], upsellOpportunities: [], churnRisk: 'unknown', languageExpansion: [], communicationStyle: text, recommendations: [] };
  }
}

module.exports = router;
