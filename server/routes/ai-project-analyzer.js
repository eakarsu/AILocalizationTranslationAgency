const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { projectDescription, sourceLanguage, targetLanguages, wordCount, contentType, deadline, budget } = req.body;
    const systemPrompt = `You are a translation project management expert.
Analyze project parameters and provide estimates for cost, timeline, resources, and risks.
Respond with JSON: { "estimatedCost": {"total": 0, "perLanguage": [{"language": "...", "cost": 0}]}, "timeline": {"totalDays": 0, "milestones": [{"phase": "...", "days": 0, "description": "..."}]}, "risks": [{"risk": "...", "likelihood": "high|medium|low", "mitigation": "..."}], "resourceNeeds": [{"role": "...", "count": 0, "skills": ["..."]}], "complexityScore": 0-100, "recommendations": ["..."], "workflowSuggestion": "..." }`;

    const prompt = `Analyze this translation project and provide estimates.
Project description: ${projectDescription || 'not provided'}
Source language: ${sourceLanguage || 'English'}
Target languages: ${Array.isArray(targetLanguages) ? targetLanguages.join(', ') : targetLanguages || 'not specified'}
Word count: ${wordCount || 'unknown'}
Content type: ${contentType || 'general'}
Deadline: ${deadline || 'flexible'}
Budget: ${budget || 'not specified'}`;

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
    return { estimatedCost: { total: 0, perLanguage: [] }, timeline: { totalDays: 0, milestones: [] }, risks: [], resourceNeeds: [], complexityScore: 0, recommendations: [], workflowSuggestion: text };
  } catch {
    return { estimatedCost: { total: 0, perLanguage: [] }, timeline: { totalDays: 0, milestones: [] }, risks: [], resourceNeeds: [], complexityScore: 0, recommendations: [], workflowSuggestion: text };
  }
}

module.exports = router;
