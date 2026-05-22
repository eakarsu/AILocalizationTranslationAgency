// interpFeat_dialectAdaptation.js — Real-Time Interpretation: Dialect Detection & Adaptation
// Mount: /api/interp/dialect-adaptation
// 18 CRUD + 16 AI verbs

const express = require('express');
const router = express.Router();
const { ensureInterpTables } = require('../models/interpretation');
const TABLE = 'interp_dialect_adaptations';

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
          { role: 'system', content: `You are a dialect and sociolinguistics expert for real-time interpretation. ${systemNote || ''}` },
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
    const { session_id, language_code, detected_dialect, region_tag, formality_level, sociolect, adaptation_rules, dialect_meta } = req.body;
    const r = await db.query(
      `INSERT INTO ${TABLE} (session_id,language_code,detected_dialect,region_tag,formality_level,sociolect,adaptation_rules,dialect_meta) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [session_id, language_code, detected_dialect, region_tag, formality_level, sociolect, JSON.stringify(adaptation_rules || []), JSON.stringify(dialect_meta || {})]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const fields = ['language_code','detected_dialect','region_tag','formality_level','sociolect','adaptation_rules','recognition_score','code_switching_detected','bilingual_handling','dialect_meta'];
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

router.get('/by-language/:langCode', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE language_code=$1 AND deleted_at IS NULL ORDER BY id DESC LIMIT 50`, [req.params.langCode]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`INSERT INTO ${TABLE} (session_id,language_code,detected_dialect,region_tag) VALUES($1,$2,$3,$4) RETURNING *`,
        [b.session_id, b.language_code, b.detected_dialect, b.region_tag])
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
      db.query(`UPDATE ${TABLE} SET recognition_score=$1,formality_level=$2,updated_at=NOW() WHERE id=$3 AND deleted_at IS NULL RETURNING *`, [b.recognition_score, b.formality_level, b.id])
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
    if (req.query.language_code) { where.push(`language_code=$${vals.length+1}`); vals.push(req.query.language_code); }
    if (req.query.detected_dialect) { where.push(`detected_dialect=$${vals.length+1}`); vals.push(req.query.detected_dialect); }
    const clause = where.length ? `AND ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL ${clause}`, vals);
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const q = `%${req.query.q || ''}%`;
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL AND (language_code ILIKE $1 OR detected_dialect ILIKE $1 OR region_tag ILIKE $1 OR sociolect ILIKE $1) ORDER BY id DESC LIMIT 50`, [q]);
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
    const r = await db.query(`SELECT id,language_code,detected_dialect,recognition_score,updated_at FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    res.json({ id: req.params.id, history: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/export-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,session_id,language_code,detected_dialect,region_tag,recognition_score,created_at FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC`);
    const header = 'id,session_id,language_code,detected_dialect,region_tag,recognition_score,created_at';
    const rows = r.rows.map(row => `${row.id},${row.session_id||''},"${row.language_code||''}","${row.detected_dialect||''}","${row.region_tag||''}",${row.recognition_score||''},"${row.created_at||''}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dialect-adaptations-${Date.now()}.csv"`);
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
      await db.query(`INSERT INTO ${TABLE} (session_id,language_code,detected_dialect,region_tag) VALUES($1,$2,$3,$4)`, [row.session_id, row.language_code, row.detected_dialect, row.region_tag]);
      imported++;
    }
    res.json({ imported });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats-summary', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT language_code, detected_dialect, COUNT(*) as count, AVG(recognition_score) as avg_recognition FROM ${TABLE} WHERE deleted_at IS NULL GROUP BY language_code, detected_dialect ORDER BY count DESC LIMIT 20`);
    res.json({ stats: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI verbs (16) ─────────────────────────────────────────────────────────
const AI_VERBS = [
  { verb: 'detect-dialect', prompt: (b) => `Detect dialect from sample text: "${(b.text||b.sample||'').slice(0,300)}", declared language: ${b.language_code}. Return: detected_dialect, region, confidence, features_identified[].` },
  { verb: 'suggest-dialect-model', prompt: (b) => `Suggest the best ASR/MT dialect model for: language ${b.language_code}, detected_dialect "${b.detected_dialect}", region "${b.region_tag}". Return: recommended_model, alternatives[], rationale.` },
  { verb: 'classify-formality-level', prompt: (b) => `Classify formality level from sample: "${(b.text||b.sample||'').slice(0,300)}", language ${b.language_code}, dialect "${b.detected_dialect}". Return: formality_level (formal/neutral/informal/vernacular), markers[].` },
  { verb: 'predict-comprehension-mismatch', prompt: (b) => `Predict comprehension mismatch risk when adapting from dialect "${b.detected_dialect}" to standard ${b.language_code}. Return: mismatch_risk (low/medium/high), problem_areas[], mitigation[].` },
  { verb: 'recommend-dialect-switch', prompt: (b) => `Should interpreter switch dialect model? Current: "${b.detected_dialect}", recognition_score ${b.recognition_score}. Return: switch_recommended (bool), target_dialect, trigger_threshold.` },
  { verb: 'generate-dialect-adaptation-rule', prompt: (b) => `Generate dialect adaptation rules for: source_dialect "${b.detected_dialect}", language ${b.language_code}, target register "${b.formality_level}". Return: rules[] with pattern, substitution, scope.` },
  { verb: 'summarize-dialect-usage', prompt: (b) => `Summarize dialect usage in session ${b.session_id}: dialect "${b.detected_dialect}", language ${b.language_code}, recognition ${b.recognition_score}. Return: summary, adaptation_quality, recommendations[].` },
  { verb: 'score-dialect-recognition', prompt: (b) => `Score dialect recognition quality: current score ${b.recognition_score}, dialect "${b.detected_dialect}", language ${b.language_code}. Return: adjusted_score, bottlenecks[], improvement_steps[].` },
  { verb: 'validate-region-tagging', prompt: (b) => `Validate region tag "${b.region_tag}" for dialect "${b.detected_dialect}", language ${b.language_code}. Return: is_valid (bool), canonical_region, alternatives[].` },
  { verb: 'suggest-style-adjustment', prompt: (b) => `Suggest style adjustments for interpretation from dialect "${b.detected_dialect}" to standard ${b.language_code}, formality "${b.formality_level}". Return: adjustments[] with category, rule, example.` },
  { verb: 'detect-code-switching', prompt: (b) => `Detect code-switching in sample: "${(b.text||b.sample||'').slice(0,300)}", primary language ${b.language_code}. Return: code_switching_detected (bool), switched_segments[], languages_involved[].` },
  { verb: 'recommend-bilingual-handling', prompt: (b) => `Recommend bilingual handling strategy for code-switching in ${b.language_code}. Code-switching detected: ${b.code_switching_detected}. Return: strategy, handling_rules[], edge_cases[].` },
  { verb: 'classify-sociolect', prompt: (b) => `Classify sociolect from sample: "${(b.text||b.sample||'').slice(0,300)}", language ${b.language_code}. Return: sociolect_type, social_group_indicators[], register.` },
  { verb: 'predict-listener-confusion', prompt: (b) => `Predict listener confusion risk when interpreting dialect "${b.detected_dialect}" in real-time. Target audience: ${JSON.stringify(b.dialect_meta||{})}. Return: confusion_risk, confusion_triggers[], recommendations[].` },
  { verb: 'generate-dialect-doc', prompt: (b) => `Generate documentation for dialect "${b.detected_dialect}" of language ${b.language_code}, region "${b.region_tag}". Return: overview, linguistic_features[], interpretation_notes[], common_pitfalls[].` },
  { verb: 'suggest-prosody-adjust', prompt: (b) => `Suggest prosody adjustments for TTS/interpretation of dialect "${b.detected_dialect}", language ${b.language_code}. Return: rate, pitch_patterns[], stress_rules[], rhythm_notes.` }
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
