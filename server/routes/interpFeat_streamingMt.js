// interpFeat_streamingMt.js — Real-Time Interpretation: Streaming Machine Translation
// Mount: /api/interp/streaming-mt
// 18 CRUD + 16 AI verbs

const express = require('express');
const router = express.Router();
const { ensureInterpTables } = require('../models/interpretation');
const TABLE = 'interp_mt_segments';

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
          { role: 'system', content: `You are an expert in real-time machine translation for interpretation. ${systemNote || ''}` },
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
    const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
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
    const { session_id, source_lang, target_lang, source_text, domain, glossary_pack_id, context_window, mt_meta } = req.body;
    const r = await db.query(
      `INSERT INTO ${TABLE} (session_id,source_lang,target_lang,source_text,domain,glossary_pack_id,context_window,mt_meta) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [session_id, source_lang, target_lang, source_text, domain, glossary_pack_id, context_window, JSON.stringify(mt_meta || {})]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const fields = ['source_lang','target_lang','source_text','translated_text','post_edit_text','domain','quality_score','latency_ms','glossary_pack_id','context_window','error_type','mt_meta'];
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
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE session_id=$1 AND deleted_at IS NULL ORDER BY id ASC`, [req.params.sessionId]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/by-lang-pair/:source/:target', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE source_lang=$1 AND target_lang=$2 AND deleted_at IS NULL ORDER BY id DESC LIMIT 50`, [req.params.source, req.params.target]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`INSERT INTO ${TABLE} (session_id,source_lang,target_lang,source_text,domain) VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [b.session_id, b.source_lang, b.target_lang, b.source_text, b.domain])
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
      db.query(`UPDATE ${TABLE} SET translated_text=$1,quality_score=$2,updated_at=NOW() WHERE id=$3 AND deleted_at IS NULL RETURNING *`, [b.translated_text, b.quality_score, b.id])
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
    if (req.query.source_lang) { where.push(`source_lang=$${vals.length+1}`); vals.push(req.query.source_lang); }
    if (req.query.target_lang) { where.push(`target_lang=$${vals.length+1}`); vals.push(req.query.target_lang); }
    const clause = where.length ? `AND ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL ${clause}`, vals);
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const q = `%${req.query.q || ''}%`;
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL AND (source_text ILIKE $1 OR translated_text ILIKE $1 OR domain ILIKE $1) ORDER BY id DESC LIMIT 50`, [q]);
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
    const r = await db.query(`SELECT id,source_lang,target_lang,quality_score,updated_at FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    res.json({ id: req.params.id, history: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/export-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,session_id,source_lang,target_lang,domain,quality_score,created_at FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC`);
    const header = 'id,session_id,source_lang,target_lang,domain,quality_score,created_at';
    const rows = r.rows.map(row => `${row.id},${row.session_id || ''},"${row.source_lang || ''}","${row.target_lang || ''}","${row.domain || ''}",${row.quality_score || ''},"${row.created_at || ''}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mt-segments-${Date.now()}.csv"`);
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
      await db.query(`INSERT INTO ${TABLE} (session_id,source_lang,target_lang,source_text) VALUES($1,$2,$3,$4)`, [row.session_id, row.source_lang, row.target_lang, row.source_text]);
      imported++;
    }
    res.json({ imported });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats-summary', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT source_lang, target_lang, COUNT(*) as count, AVG(quality_score) as avg_quality, AVG(latency_ms) as avg_latency FROM ${TABLE} WHERE deleted_at IS NULL GROUP BY source_lang, target_lang ORDER BY count DESC LIMIT 20`);
    res.json({ stats: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI verbs (16) ─────────────────────────────────────────────────────────
const AI_VERBS = [
  { verb: 'classify-domain', prompt: (b) => `Classify the domain of this MT segment. Source text: "${b.source_text}", language pair: ${b.source_lang}->${b.target_lang}. Return: domain, confidence, sub_domain.` },
  { verb: 'suggest-glossary-pack', prompt: (b) => `Suggest the best glossary pack for: domain "${b.domain}", language pair ${b.source_lang}->${b.target_lang}. Return: recommended_pack, alternatives[], reason.` },
  { verb: 'predict-translation-quality', prompt: (b) => `Predict MT quality for: source "${b.source_text}", domain ${b.domain}, lang pair ${b.source_lang}->${b.target_lang}. Return: predicted_quality (0-1), risk_factors[].` },
  { verb: 'detect-untranslatable-segment', prompt: (b) => `Identify untranslatable elements in: "${b.source_text}" (${b.source_lang}). Return: untranslatable_spans[], handling_strategies[].` },
  { verb: 'recommend-context-window', prompt: (b) => `Recommend context window size for MT of domain "${b.domain}", language pair ${b.source_lang}->${b.target_lang}. Return: recommended_tokens, rationale.` },
  { verb: 'generate-mt-correction', prompt: (b) => `Generate a post-edit correction for MT output: source="${b.source_text}", translation="${b.translated_text}", language pair ${b.source_lang}->${b.target_lang}. Return: corrected_translation, changes_made[].` },
  { verb: 'summarize-mt-session', prompt: (b) => `Summarize MT session ${b.session_id}: total segments, domains, quality. Data: ${JSON.stringify(b)}. Return: summary, avg_quality, key_issues[].` },
  { verb: 'score-mt-confidence', prompt: (b) => `Score MT confidence for: source="${b.source_text}", translation="${b.translated_text}". Return: confidence_score (0-1), low_confidence_spans[].` },
  { verb: 'validate-language-pair', prompt: (b) => `Validate language pair ${b.source_lang}->${b.target_lang} for real-time interpretation MT. Return: is_valid, support_level, known_limitations[].` },
  { verb: 'suggest-formal-vs-informal', prompt: (b) => `Suggest formal or informal register for: target_lang ${b.target_lang}, domain "${b.domain}", context ${JSON.stringify(b.mt_meta)}. Return: recommended_register, rationale.` },
  { verb: 'detect-named-entity-issue', prompt: (b) => `Detect named entity translation issues in: source="${b.source_text}", translation="${b.translated_text}". Return: entity_issues[] with original, translated, issue_type.` },
  { verb: 'recommend-back-translation', prompt: (b) => `Should back-translation be used for: domain "${b.domain}", quality_score ${b.quality_score}? Return: recommended (bool), trigger_conditions[], method.` },
  { verb: 'classify-mt-error-type', prompt: (b) => `Classify MT error type in: source="${b.source_text}", translation="${b.translated_text}". Return: error_types[] (fluency/adequacy/terminology/style), severity.` },
  { verb: 'predict-latency-spike', prompt: (b) => `Predict latency spike risk for: domain "${b.domain}", source length ${(b.source_text||'').length}, current latency ${b.latency_ms}ms. Return: spike_risk (low/medium/high), triggers[].` },
  { verb: 'generate-post-edit-suggestion', prompt: (b) => `Generate post-edit suggestion for: source="${b.source_text}", MT output="${b.translated_text}", domain="${b.domain}". Return: post_edit, edit_distance, edit_type.` },
  { verb: 'suggest-segment-retry', prompt: (b) => `Should this MT segment be retried? Quality: ${b.quality_score}, error_type: "${b.error_type}", latency: ${b.latency_ms}ms. Return: retry_recommended (bool), reason, retry_strategy.` }
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
