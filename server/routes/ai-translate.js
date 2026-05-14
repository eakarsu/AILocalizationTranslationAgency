const express = require('express');
const router = express.Router();
const { callOpenRouter, parseAIJson } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const pool = req.app.get('db');
    const { text, sourceLanguage, targetLanguage, tone, domain } = req.body;

    // Fetch relevant glossary terms
    let glossaryTerms = {};
    let glossaryApplied = false;
    try {
      const glossaryResult = await pool.query(
        `SELECT term, definition FROM glossary WHERE language_pair_id IS NULL OR language_pair_id = $1 LIMIT 20`,
        [null]
      );
      if (glossaryResult.rows.length > 0) {
        glossaryResult.rows.forEach(row => {
          glossaryTerms[row.term] = row.definition;
        });
        glossaryApplied = true;
      }
    } catch (e) {
      // Glossary table may not exist yet, continue without it
    }

    const glossaryInstructions = glossaryApplied && Object.keys(glossaryTerms).length > 0
      ? `\nUse these approved glossary terms: ${JSON.stringify(glossaryTerms)}`
      : '';

    const systemPrompt = `You are an expert translator specializing in ${domain || 'general'} content.
Translate text accurately while maintaining the original meaning, tone, and cultural nuances.${glossaryInstructions}
Respond with a JSON object: { "translation": "...", "alternatives": ["..."], "notes": "...", "confidence": 0.95 }`;

    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.
${tone ? `Desired tone: ${tone}` : ''}
${domain ? `Domain: ${domain}` : ''}

Text to translate:
"""
${text}
"""`;

    const rawResult = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(rawResult) || { translation: rawResult, alternatives: [], notes: '', confidence: 0.8 };

    // Fire-and-forget persist to ai_results
    const userId = req.user ? req.user.id : null;
    pool.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)`,
      [userId, 'translate', JSON.stringify({ text, sourceLanguage, targetLanguage, tone, domain }), JSON.stringify(parsed)]
    ).catch(() => {});

    res.json({ success: true, result: parsed, glossaryApplied });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
