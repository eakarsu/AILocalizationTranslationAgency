const express = require('express');
const router = express.Router();

// GET paginated AI results for current user
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('db');
    const userId = req.user ? req.user.id : null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM ai_results WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, endpoint, input_data, result, created_at FROM ai_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
