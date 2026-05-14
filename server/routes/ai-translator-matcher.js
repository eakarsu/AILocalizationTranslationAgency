const express = require('express');
const router = express.Router();
const { callOpenRouter, parseAIJson } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const pool = req.app.get('db');
    const { projectRequirements, sourceLanguage, targetLanguage, domain, deadline, qualityTier } = req.body;

    // Fetch top 10 translators from DB
    let dbTranslators = [];
    try {
      const result = await pool.query(
        `SELECT name, languages, specializations, rating, status, rate_per_word, experience_years
         FROM translators
         WHERE status = 'available' OR status IS NULL
         ORDER BY rating DESC NULLS LAST
         LIMIT 10`
      );
      dbTranslators = result.rows;
    } catch (e) {
      // Table may not exist
    }

    const translatorContext = dbTranslators.length > 0
      ? `\nAvailable translators from our database:\n${JSON.stringify(dbTranslators, null, 2)}`
      : '';

    const systemPrompt = `You are a resource allocation specialist for translation services.
Match translators to projects based on skills, availability, and project requirements.${translatorContext}
Respond with JSON: { "top_matches": [{"translator_name": "...", "match_score": 0-100, "reasons": ["..."]}], "recommendation": "...", "rankedCandidates": [{"rank": 1, "name": "...", "matchScore": 0-100, "strengths": ["..."], "concerns": ["..."]}], "teamRecommendation": "...", "workloadAnalysis": "...", "riskFactors": ["..."], "recommendations": ["..."] }`;

    const prompt = `Match translators to this project.
Project requirements: ${projectRequirements || 'not provided'}
Source language: ${sourceLanguage || 'English'}
Target language: ${targetLanguage || 'not specified'}
Domain: ${domain || 'general'}
Deadline: ${deadline || 'flexible'}
Quality tier: ${qualityTier || 'standard'}`;

    const rawResult = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(rawResult) || { top_matches: [], recommendation: rawResult, rankedCandidates: [], teamRecommendation: rawResult, workloadAnalysis: '', riskFactors: [], recommendations: [] };

    // Fire-and-forget persist
    const userId = req.user ? req.user.id : null;
    pool.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)`,
      [userId, 'translator-matcher', JSON.stringify({ projectRequirements, sourceLanguage, targetLanguage, domain, deadline, qualityTier }), JSON.stringify(parsed)]
    ).catch(() => {});

    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
