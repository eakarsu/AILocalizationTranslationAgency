const express = require('express');
const router = express.Router();
const { callOpenRouter, parseAIJson } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const pool = req.app.get('db');
    const { projectId } = req.body;

    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    // Fetch project, orders, and translators from DB
    let project = null;
    let orders = [];
    let translators = [];
    try {
      const projResult = await pool.query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
      if (projResult.rows.length > 0) project = projResult.rows[0];

      const ordersResult = await pool.query(`SELECT * FROM orders WHERE project_id = $1`, [projectId]);
      orders = ordersResult.rows;

      const translatorResult = await pool.query(`SELECT name, languages, rate_per_word, rating FROM translators WHERE status = 'available' LIMIT 5`);
      translators = translatorResult.rows;
    } catch (e) {
      // Tables may not be set up
    }

    const systemPrompt = `You are a pricing specialist for translation services.
Generate accurate project quotes based on scope, complexity, and available resources.
Return JSON: { "total_words": number, "estimated_hours": number, "base_rate_per_word": number, "total_cost": number, "delivery_date_estimate": "YYYY-MM-DD", "translator_recommendation": "...", "payment_terms": "...", "breakdown": {"translation": number, "editing": number, "proofreading": number} }`;

    const prompt = `Generate a translation project quote.
Project: ${JSON.stringify(project || { id: projectId, name: 'Unknown Project' })}
Orders: ${JSON.stringify(orders)}
Available translators: ${JSON.stringify(translators)}`;

    const rawResult = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(rawResult);

    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response' });

    // Fire-and-forget persist
    const userId = req.user ? req.user.id : null;
    pool.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)`,
      [userId, 'generate-quote', JSON.stringify({ projectId }), JSON.stringify(parsed)]
    ).catch(() => {});

    res.json({ success: true, result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
