// interpFeat_speakerDiarization.js — Real-Time Interpretation: Speaker Diarization
// Mount: /api/interp/speaker-diarization
// 18 CRUD + 16 AI verbs

const express = require('express');
const router = express.Router();
const { ensureInterpTables } = require('../models/interpretation');
const TABLE = 'interp_speaker_diarizations';

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
          { role: 'system', content: `You are an expert in speaker diarization and turn-taking for real-time interpretation. ${systemNote || ''}` },
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

router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 20, offset = (page - 1) * limit;
    const total = (await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL`)).rows[0].count;
    const rows = (await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC LIMIT $1 OFFSET $2`, [limit, offset])).rows;
    res.json({ data: rows, pagination: { page, limit, total: parseInt(total), totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const { session_id, num_speakers, speaker_labels, mic_config, min_segment_duration_ms, diarization_meta } = req.body;
    const r = await db.query(
      `INSERT INTO ${TABLE} (session_id,num_speakers,speaker_labels,mic_config,min_segment_duration_ms,diarization_meta) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [session_id, num_speakers, JSON.stringify(speaker_labels || []), mic_config, min_segment_duration_ms, JSON.stringify(diarization_meta || {})]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const fields = ['num_speakers','speaker_labels','turn_distribution','accuracy_score','mic_config','channel_split','crosstalk_detected','impostor_detected','min_segment_duration_ms','diarization_meta'];
    const setCols = [], vals = [];
    fields.forEach(f => { if (req.body[f] !== undefined) { setCols.push(`${f}=$${vals.length+1}`); vals.push(typeof req.body[f] === 'object' ? JSON.stringify(req.body[f]) : req.body[f]); } });
    if (!setCols.length) return res.status(400).json({ error: 'No fields to update' });
    vals.push(req.params.id);
    const r = await db.query(`UPDATE ${TABLE} SET ${setCols.join(',')},updated_at=NOW() WHERE id=$${vals.length} AND deleted_at IS NULL RETURNING *`, vals);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`UPDATE ${TABLE} SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING id`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, id: r.rows[0].id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/by-session/:sessionId', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE session_id=$1 AND deleted_at IS NULL ORDER BY id DESC`, [req.params.sessionId]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/by-num-speakers/:count', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE num_speakers=$1 AND deleted_at IS NULL ORDER BY id DESC LIMIT 50`, [req.params.count]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`INSERT INTO ${TABLE} (session_id,num_speakers,mic_config) VALUES($1,$2,$3) RETURNING *`,
        [b.session_id, b.num_speakers, b.mic_config])
    ));
    res.status(201).json({ created: results.map(r => r.rows[0]) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`UPDATE ${TABLE} SET accuracy_score=$1,num_speakers=$2,updated_at=NOW() WHERE id=$3 AND deleted_at IS NULL RETURNING *`, [b.accuracy_score, b.num_speakers, b.id])
    ));
    res.json({ updated: results.map(r => r.rows[0]).filter(Boolean) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const ids = req.body.ids;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids[] required' });
    await db.query(`UPDATE ${TABLE} SET deleted_at=NOW() WHERE id=ANY($1) AND deleted_at IS NULL`, [ids]);
    res.json({ deleted: true, ids });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/count', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const where = []; const vals = [];
    if (req.query.session_id) { where.push(`session_id=$${vals.length+1}`); vals.push(req.query.session_id); }
    if (req.query.num_speakers) { where.push(`num_speakers=$${vals.length+1}`); vals.push(req.query.num_speakers); }
    const clause = where.length ? `AND ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL ${clause}`, vals);
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const q = `%${req.query.q || ''}%`;
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL AND (mic_config ILIKE $1) ORDER BY id DESC LIMIT 50`, [q]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id(\\d+)/archive', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`UPDATE ${TABLE} SET archived_at=NOW(),updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING *`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id(\\d+)/restore', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`UPDATE ${TABLE} SET deleted_at=NULL,updated_at=NOW() WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id(\\d+)/history', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,num_speakers,accuracy_score,crosstalk_detected,updated_at FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    res.json({ id: req.params.id, history: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/export-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,session_id,num_speakers,accuracy_score,mic_config,crosstalk_detected,created_at FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC`);
    const header = 'id,session_id,num_speakers,accuracy_score,mic_config,crosstalk_detected,created_at';
    const rows = r.rows.map(row => `${row.id},${row.session_id||''},${row.num_speakers||''},${row.accuracy_score||''},"${row.mic_config||''}",${row.crosstalk_detected||false},"${row.created_at||''}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="diarizations-${Date.now()}.csv"`);
    res.send([header, ...rows].join('\n'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/import-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const rows = req.body.rows;
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows[] required' });
    let imported = 0;
    for (const row of rows) {
      await db.query(`INSERT INTO ${TABLE} (session_id,num_speakers,mic_config) VALUES($1,$2,$3)`, [row.session_id, row.num_speakers, row.mic_config]);
      imported++;
    }
    res.json({ imported });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats-summary', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT num_speakers, COUNT(*) as count, AVG(accuracy_score) as avg_accuracy, SUM(CASE WHEN crosstalk_detected THEN 1 ELSE 0 END) as crosstalk_count FROM ${TABLE} WHERE deleted_at IS NULL GROUP BY num_speakers ORDER BY num_speakers`);
    res.json({ stats: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI verbs (16) ─────────────────────────────────────────────────────────
const AI_VERBS = [
  { verb: 'classify-speaker', prompt: (b) => `Classify speaker role from transcript segment: "${(b.text||b.segment||'').slice(0,300)}", context: ${JSON.stringify(b.diarization_meta||{})}. Return: speaker_role (patient/doctor/interpreter/lawyer/witness/other), confidence.` },
  { verb: 'detect-new-speaker', prompt: (b) => `Detect if a new speaker has entered in transcript: "${(b.text||b.segment||'').slice(0,300)}". Current speaker count: ${b.num_speakers}. Return: new_speaker_detected (bool), confidence, cues[].` },
  { verb: 'predict-speaker-turn', prompt: (b) => `Predict next speaker turn in conversation with ${b.num_speakers} speakers. Turn distribution: ${JSON.stringify(b.turn_distribution)}. Return: predicted_next_speaker, confidence, turn_likelihood{}.` },
  { verb: 'recommend-mic-config', prompt: (b) => `Recommend microphone configuration for ${b.num_speakers} speakers, current config "${b.mic_config}". Return: recommended_config, setup_notes[], channel_map.` },
  { verb: 'score-diarization-accuracy', prompt: (b) => `Score diarization accuracy for session with ${b.num_speakers} speakers, current accuracy ${b.accuracy_score}. Crosstalk: ${b.crosstalk_detected}. Return: adjusted_score, bottlenecks[], improvement_actions[].` },
  { verb: 'generate-speaker-labels', prompt: (b) => `Generate descriptive speaker labels for ${b.num_speakers} speakers in context: ${JSON.stringify(b.diarization_meta||{})}. Return: labels[] with speaker_id, label, role, confidence.` },
  { verb: 'summarize-turn-distribution', prompt: (b) => `Summarize turn distribution for ${b.num_speakers} speakers: ${JSON.stringify(b.turn_distribution)}. Return: summary, dominant_speaker, balance_score, recommendations[].` },
  { verb: 'validate-speaker-count', prompt: (b) => `Validate speaker count of ${b.num_speakers} for session. Mic config: "${b.mic_config}". Return: is_valid (bool), detected_count, discrepancy_reason.` },
  { verb: 'suggest-overlap-handling', prompt: (b) => `Suggest handling strategy for overlapping speech. Crosstalk detected: ${b.crosstalk_detected}, speakers: ${b.num_speakers}. Return: strategy, handling_rules[], priority_speaker_selection.` },
  { verb: 'detect-crosstalk', prompt: (b) => `Detect crosstalk in audio session with ${b.num_speakers} speakers, mic config "${b.mic_config}". Return: crosstalk_detected (bool), segments_affected[], severity.` },
  { verb: 'recommend-channel-split', prompt: (b) => `Should channel split be applied for ${b.num_speakers} speakers, mic "${b.mic_config}"? Crosstalk: ${b.crosstalk_detected}. Return: split_recommended (bool), channel_mapping[], expected_improvement.` },
  { verb: 'classify-speaker-role', prompt: (b) => `Classify roles for ${b.num_speakers} speakers in context: ${JSON.stringify(b.diarization_meta||{})}. Return: role_assignments[] with speaker_id, role, confidence.` },
  { verb: 'predict-speaker-id-confidence', prompt: (b) => `Predict speaker identification confidence for ${b.num_speakers} speakers, accuracy ${b.accuracy_score}, crosstalk ${b.crosstalk_detected}. Return: per_speaker_confidence[], avg_confidence, risk_factors[].` },
  { verb: 'generate-diarization-doc', prompt: (b) => `Generate diarization report for session ${b.session_id}: ${b.num_speakers} speakers, accuracy ${b.accuracy_score}, mic "${b.mic_config}". Return: report_title, speaker_profiles[], session_quality, recommendations[].` },
  { verb: 'suggest-min-segment-duration', prompt: (b) => `Suggest optimal minimum segment duration for ${b.num_speakers} speakers, mic "${b.mic_config}", current ${b.min_segment_duration_ms}ms. Return: recommended_ms, rationale, trade_offs[].` },
  { verb: 'detect-impostor-speaker', prompt: (b) => `Detect if an impostor speaker is present in session. Expected speakers: ${b.num_speakers}, labels: ${JSON.stringify(b.speaker_labels||[])}. Return: impostor_detected (bool), suspicious_speaker_id, evidence[].` }
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
