// interpFeat_streamingTts.js — Real-Time Interpretation: Streaming TTS
// Mount: /api/interp/streaming-tts
// 18 CRUD + 16 AI verbs

const express = require('express');
const router = express.Router();
const { ensureInterpTables } = require('../models/interpretation');
const TABLE = 'interp_tts_sessions';

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
          { role: 'system', content: `You are an expert in real-time text-to-speech for interpretation. ${systemNote || ''}` },
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
    const { session_token, user_id, voice_id, voice_style, language_code, text_input, prosody_settings, tts_meta } = req.body;
    const r = await db.query(
      `INSERT INTO ${TABLE} (session_token,user_id,voice_id,voice_style,language_code,text_input,prosody_settings,tts_meta) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [session_token, user_id, voice_id, voice_style, language_code, text_input, JSON.stringify(prosody_settings || {}), JSON.stringify(tts_meta || {})]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const fields = ['voice_id','voice_style','language_code','text_input','ssml_output','audio_url','naturalness_score','quality_score','status','prosody_settings','tts_meta'];
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

router.get('/by-session/:token', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE session_token=$1 AND deleted_at IS NULL ORDER BY id DESC`, [req.params.token]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/by-voice/:voiceId', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE voice_id=$1 AND deleted_at IS NULL ORDER BY id DESC LIMIT 50`, [req.params.voiceId]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`INSERT INTO ${TABLE} (session_token,user_id,voice_id,language_code,text_input) VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [b.session_token, b.user_id, b.voice_id, b.language_code, b.text_input])
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
      db.query(`UPDATE ${TABLE} SET status=$1,quality_score=$2,updated_at=NOW() WHERE id=$3 AND deleted_at IS NULL RETURNING *`, [b.status, b.quality_score, b.id])
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
    if (req.query.status) { where.push(`status=$${vals.length+1}`); vals.push(req.query.status); }
    if (req.query.language_code) { where.push(`language_code=$${vals.length+1}`); vals.push(req.query.language_code); }
    const clause = where.length ? `AND ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL ${clause}`, vals);
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const q = `%${req.query.q || ''}%`;
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL AND (voice_id ILIKE $1 OR language_code ILIKE $1 OR voice_style ILIKE $1) ORDER BY id DESC LIMIT 50`, [q]);
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
    const r = await db.query(`SELECT id,voice_id,status,quality_score,updated_at FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    res.json({ id: req.params.id, history: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/export-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,session_token,voice_id,language_code,status,naturalness_score,created_at FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC`);
    const header = 'id,session_token,voice_id,language_code,status,naturalness_score,created_at';
    const rows = r.rows.map(row => `${row.id},"${row.session_token||''}","${row.voice_id||''}","${row.language_code||''}","${row.status||''}",${row.naturalness_score||''},"${row.created_at||''}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tts-sessions-${Date.now()}.csv"`);
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
      await db.query(`INSERT INTO ${TABLE} (session_token,voice_id,language_code,text_input) VALUES($1,$2,$3,$4)`, [row.session_token, row.voice_id, row.language_code, row.text_input]);
      imported++;
    }
    res.json({ imported });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats-summary', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT language_code, voice_style, COUNT(*) as count, AVG(naturalness_score) as avg_naturalness, AVG(quality_score) as avg_quality FROM ${TABLE} WHERE deleted_at IS NULL GROUP BY language_code, voice_style ORDER BY count DESC LIMIT 20`);
    res.json({ stats: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI verbs (16) ─────────────────────────────────────────────────────────
const AI_VERBS = [
  { verb: 'classify-voice-style', prompt: (b) => `Classify the voice style needed for TTS. Language: ${b.language_code}, context: ${JSON.stringify(b.tts_meta)}. Return: voice_style, formality, affect.` },
  { verb: 'suggest-voice-match', prompt: (b) => `Suggest the best matching TTS voice for: language ${b.language_code}, style "${b.voice_style}", text: "${(b.text_input||'').slice(0,200)}". Return: recommended_voice_id, alternatives[], match_score.` },
  { verb: 'predict-naturalness-score', prompt: (b) => `Predict naturalness score for TTS of text: "${(b.text_input||'').slice(0,200)}", voice ${b.voice_id}, language ${b.language_code}. Return: predicted_naturalness (0-1), risk_factors[].` },
  { verb: 'detect-mispronunciation', prompt: (b) => `Detect likely mispronunciations in TTS for text: "${(b.text_input||'').slice(0,300)}", language ${b.language_code}. Return: mispronunciation_risks[] with word, ipa_correct, issue.` },
  { verb: 'recommend-prosody-adjust', prompt: (b) => `Recommend prosody adjustments for: text="${(b.text_input||'').slice(0,200)}", language ${b.language_code}, voice ${b.voice_id}. Return: rate, pitch, volume, pause_points[].` },
  { verb: 'generate-ssml', prompt: (b) => `Generate SSML markup for TTS text: "${(b.text_input||'').slice(0,300)}", language ${b.language_code}, prosody ${JSON.stringify(b.prosody_settings)}. Return: ssml_output.` },
  { verb: 'summarize-tts-session', prompt: (b) => `Summarize TTS session: voice ${b.voice_id}, language ${b.language_code}, naturalness ${b.naturalness_score}, quality ${b.quality_score}. Return: summary, recommendations[].` },
  { verb: 'score-tts-quality', prompt: (b) => `Score overall TTS quality for: naturalness ${b.naturalness_score}, voice "${b.voice_id}", language ${b.language_code}. Return: quality_score (0-1), breakdown{}, improvement_hints[].` },
  { verb: 'validate-text-segment-length', prompt: (b) => `Validate if text length ${(b.text_input||'').length} chars is appropriate for real-time TTS in language ${b.language_code}. Return: is_valid, max_recommended_chars, chunking_strategy.` },
  { verb: 'suggest-pause-insertion', prompt: (b) => `Suggest pause insertion points for TTS text: "${(b.text_input||'').slice(0,300)}". Return: pause_points[] with position, duration_ms, reason.` },
  { verb: 'detect-foreign-word', prompt: (b) => `Detect foreign words in TTS text: "${(b.text_input||'').slice(0,300)}" (primary language: ${b.language_code}). Return: foreign_words[] with word, detected_lang, handling_suggestion.` },
  { verb: 'recommend-phoneme-override', prompt: (b) => `Recommend phoneme overrides for proper pronunciation in language ${b.language_code}, text: "${(b.text_input||'').slice(0,200)}". Return: overrides[] with word, phoneme_ipa, reason.` },
  { verb: 'classify-emotion-needed', prompt: (b) => `Classify the emotion/affect needed for TTS of: "${(b.text_input||'').slice(0,200)}" in context ${JSON.stringify(b.tts_meta)}. Return: emotion, intensity, voice_modulation_hints[].` },
  { verb: 'predict-listener-fatigue', prompt: (b) => `Predict listener fatigue risk for: voice "${b.voice_id}", text length ${(b.text_input||'').length}, naturalness ${b.naturalness_score}. Return: fatigue_risk (low/medium/high), onset_estimate_mins, mitigation[].` },
  { verb: 'generate-tts-script-cleanup', prompt: (b) => `Clean up this TTS script for optimal speech synthesis: "${(b.text_input||'').slice(0,400)}", language ${b.language_code}. Return: cleaned_script, changes_made[].` },
  { verb: 'suggest-voice-swap', prompt: (b) => `Current voice ${b.voice_id} has quality score ${b.quality_score}. Suggest a better voice swap. Language: ${b.language_code}, style: ${b.voice_style}. Return: swap_recommended (bool), new_voice_id, expected_improvement.` }
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
