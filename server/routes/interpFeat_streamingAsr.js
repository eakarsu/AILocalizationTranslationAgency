// interpFeat_streamingAsr.js — Real-Time Interpretation: Streaming ASR
// Mount: /api/interp/streaming-asr
// 18 CRUD + 16 AI verbs

const express = require('express');
const router = express.Router();
const { ensureInterpTables } = require('../models/interpretation');
const TABLE = 'interp_asr_sessions';

// ─── OpenRouter helper ─────────────────────────────────────────────────────
async function callAI(prompt, systemNote) {
  const fetch = require('node-fetch');
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return { stub: true, message: 'No OPENROUTER_API_KEY configured', echo: prompt.slice(0, 200) };
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are an expert in real-time speech-to-text interpretation. ${systemNote || ''}` },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800
      })
    });
    if (!r.ok) { const t = await r.text(); return { error: true, status: r.status, body: t.slice(0, 500) }; }
    const data = await r.json();
    return { output: data?.choices?.[0]?.message?.content || JSON.stringify(data), model: data?.model };
  } catch (e) { return { error: true, message: e.message }; }
}

async function db_init(db) { await ensureInterpTables(db, [TABLE]); }

// ─── CRUD (18) ─────────────────────────────────────────────────────────────

// 1. list
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const where = req.query.status ? `WHERE status = $3` : '';
    const params = req.query.status ? [limit, offset, req.query.status] : [limit, offset];
    const total = (await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL`)).rows[0].count;
    const rows = (await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL ${req.query.status ? "AND status=$3" : ''} ORDER BY id DESC LIMIT $1 OFFSET $2`, params)).rows;
    res.json({ data: rows, pagination: { page, limit, total: parseInt(total), totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. get by id
router.get('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. create
router.post('/', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const { session_token, user_id, language_code, audio_format, sample_rate, domain_model, session_meta } = req.body;
    const r = await db.query(
      `INSERT INTO ${TABLE} (session_token,user_id,language_code,audio_format,sample_rate,domain_model,session_meta) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [session_token, user_id, language_code, audio_format, sample_rate, domain_model, JSON.stringify(session_meta || {})]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. update
router.put('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const fields = ['language_code','audio_format','sample_rate','status','partial_transcript','final_transcript','confidence_score','noise_level','domain_model','speaker_accent','vad_segments','corrections','session_meta'];
    const setCols = [], vals = [];
    fields.forEach(f => { if (req.body[f] !== undefined) { setCols.push(`${f}=$${vals.length+1}`); vals.push(typeof req.body[f] === 'object' ? JSON.stringify(req.body[f]) : req.body[f]); } });
    if (!setCols.length) return res.status(400).json({ error: 'No fields to update' });
    vals.push(req.params.id);
    const r = await db.query(`UPDATE ${TABLE} SET ${setCols.join(',')},updated_at=NOW() WHERE id=$${vals.length} AND deleted_at IS NULL RETURNING *`, vals);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. soft-delete
router.delete('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`UPDATE ${TABLE} SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING id`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, id: r.rows[0].id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. by-session
router.get('/by-session/:token', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE session_token=$1 AND deleted_at IS NULL ORDER BY id DESC`, [req.params.token]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. by-secondary (by user_id)
router.get('/by-user/:userId', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE user_id=$1 AND deleted_at IS NULL ORDER BY id DESC`, [req.params.userId]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 8. batch-create
router.post('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`INSERT INTO ${TABLE} (session_token,user_id,language_code,audio_format,sample_rate,domain_model,session_meta) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [b.session_token, b.user_id, b.language_code, b.audio_format, b.sample_rate, b.domain_model, JSON.stringify(b.session_meta || {})])
    ));
    res.status(201).json({ created: results.map(r => r.rows[0]) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 9. batch-update
router.put('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`UPDATE ${TABLE} SET status=$1,updated_at=NOW() WHERE id=$2 AND deleted_at IS NULL RETURNING *`, [b.status, b.id])
    ));
    res.json({ updated: results.map(r => r.rows[0]).filter(Boolean) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 10. batch-delete
router.delete('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const ids = req.body.ids;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids[] required' });
    await db.query(`UPDATE ${TABLE} SET deleted_at=NOW() WHERE id=ANY($1) AND deleted_at IS NULL`, [ids]);
    res.json({ deleted: true, ids });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 11. count
router.get('/count', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const where = []; const vals = [];
    if (req.query.status) { where.push(`status=$${vals.length+1}`); vals.push(req.query.status); }
    if (req.query.user_id) { where.push(`user_id=$${vals.length+1}`); vals.push(req.query.user_id); }
    const clause = where.length ? `AND ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL ${clause}`, vals);
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 12. search
router.get('/search', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const q = `%${req.query.q || ''}%`;
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL AND (language_code ILIKE $1 OR domain_model ILIKE $1 OR speaker_accent ILIKE $1) ORDER BY id DESC LIMIT 50`, [q]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 13. archive
router.post('/:id(\\d+)/archive', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`UPDATE ${TABLE} SET archived_at=NOW(),updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING *`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 14. restore
router.post('/:id(\\d+)/restore', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`UPDATE ${TABLE} SET deleted_at=NULL,updated_at=NOW() WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 15. history (audit trail stub)
router.get('/:id(\\d+)/history', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,status,language_code,updated_at FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    res.json({ id: req.params.id, history: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 16. export-csv
router.get('/export-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,session_token,language_code,status,confidence_score,created_at FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC`);
    const header = 'id,session_token,language_code,status,confidence_score,created_at';
    const rows = r.rows.map(row => `${row.id},"${row.session_token || ''}","${row.language_code || ''}","${row.status || ''}",${row.confidence_score || ''},"${row.created_at || ''}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="asr-sessions-${Date.now()}.csv"`);
    res.send([header, ...rows].join('\n'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 17. import-csv (accept JSON array for simplicity)
router.post('/import-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const rows = req.body.rows;
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows[] required' });
    let imported = 0;
    for (const row of rows) {
      await db.query(`INSERT INTO ${TABLE} (session_token,language_code,status) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, [row.session_token, row.language_code, row.status || 'active']);
      imported++;
    }
    res.json({ imported });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 18. stats-summary
router.get('/stats-summary', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT status, COUNT(*) as count, AVG(confidence_score) as avg_confidence FROM ${TABLE} WHERE deleted_at IS NULL GROUP BY status`);
    res.json({ stats: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI verbs (16) ─────────────────────────────────────────────────────────
const AI_VERBS = [
  { verb: 'classify-audio-quality', prompt: (b) => `Classify the audio quality of an ASR session. Audio format: ${b.audio_format}, sample rate: ${b.sample_rate}Hz, noise level: ${b.noise_level}. Return: quality_class (excellent/good/fair/poor), reasoning.` },
  { verb: 'suggest-language-detected', prompt: (b) => `Given partial ASR transcript: "${b.partial_transcript}" and declared language: ${b.language_code}, confirm or suggest the most likely language detected. Return: detected_language, confidence, alternatives[].` },
  { verb: 'predict-recognition-accuracy', prompt: (b) => `Predict ASR recognition accuracy for language ${b.language_code}, audio_format ${b.audio_format}, noise_level ${b.noise_level}. Return: predicted_accuracy (0-1), risk_factors[].` },
  { verb: 'detect-noise-source', prompt: (b) => `Detect likely noise source given noise_level "${b.noise_level}" and session metadata: ${JSON.stringify(b.session_meta)}. Return: noise_source, severity, mitigation_hint.` },
  { verb: 'recommend-noise-reduction', prompt: (b) => `Recommend noise reduction techniques for noise_source "${b.noise_source}" in a ${b.language_code} ASR session. Return: techniques[], priority.` },
  { verb: 'generate-vad-segments', prompt: (b) => `Generate plausible voice-activity detection segments from transcript: "${b.partial_transcript || b.final_transcript}". Return: segments[] with start_ms, end_ms, is_speech.` },
  { verb: 'summarize-asr-session', prompt: (b) => `Summarize this ASR session. Final transcript: "${b.final_transcript}". Language: ${b.language_code}. Duration context: ${JSON.stringify(b.session_meta)}. Return: summary, key_terms[], session_quality.` },
  { verb: 'score-asr-confidence', prompt: (b) => `Score ASR confidence for transcript: "${b.final_transcript}", declared confidence: ${b.confidence_score}. Return: adjusted_confidence, low_confidence_segments[], explanation.` },
  { verb: 'validate-audio-format', prompt: (b) => `Validate audio format "${b.audio_format}" for real-time ASR. Return: is_valid, recommended_format, issues[].` },
  { verb: 'suggest-sample-rate-change', prompt: (b) => `Given current sample rate ${b.sample_rate}Hz and language ${b.language_code}, suggest optimal sample rate. Return: recommended_sample_rate, reason.` },
  { verb: 'detect-overlapping-speech', prompt: (b) => `Detect overlapping speech in transcript: "${b.partial_transcript || b.final_transcript}". Return: overlap_detected (bool), segments[], confidence.` },
  { verb: 'recommend-domain-model', prompt: (b) => `Recommend the best ASR domain model for language ${b.language_code} and context: ${JSON.stringify(b.session_meta)}. Return: recommended_model, alternatives[], rationale.` },
  { verb: 'classify-speaker-accent', prompt: (b) => `Classify speaker accent from transcript: "${b.partial_transcript || b.final_transcript}", language: ${b.language_code}. Return: accent_classification, region, confidence.` },
  { verb: 'predict-rebuffer-need', prompt: (b) => `Predict if rebuffering is needed for audio_format ${b.audio_format}, sample_rate ${b.sample_rate}, noise_level ${b.noise_level}. Return: rebuffer_recommended (bool), trigger_conditions[].` },
  { verb: 'generate-asr-corrections', prompt: (b) => `Generate corrections for ASR transcript: "${b.final_transcript}" in language ${b.language_code}. Return: corrections[] with original, corrected, confidence.` },
  { verb: 'suggest-restart-stream', prompt: (b) => `Given ASR session status "${b.status}", confidence ${b.confidence_score}, noise "${b.noise_level}": should the stream be restarted? Return: restart_recommended (bool), reason, optimal_restart_delay_ms.` }
];

AI_VERBS.forEach(({ verb, prompt }) => {
  router.post(`/ai/${verb}`, async (req, res) => {
    try {
      const result = await callAI(prompt(req.body), `Task: ${verb}`);
      res.json({ verb, result, generatedAt: new Date().toISOString() });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
});

module.exports = router;
