// interpFeat_legalGlossaryPack.js — Real-Time Interpretation: Legal Glossary Packs
// Mount: /api/interp/legal-glossary-pack
// 18 CRUD + 16 AI verbs

const express = require('express');
const router = express.Router();
const { ensureInterpTables } = require('../models/interpretation');
const TABLE = 'interp_legal_glossary_packs';

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
          { role: 'system', content: `You are a legal terminology expert for multilingual court and legal interpretation. ${systemNote || ''}` },
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
    const { name, language_pair, jurisdiction, legal_area, terms, faux_amis, version } = req.body;
    const r = await db.query(
      `INSERT INTO ${TABLE} (name,language_pair,jurisdiction,legal_area,terms,faux_amis,version) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, language_pair, jurisdiction, legal_area, JSON.stringify(terms || []), JSON.stringify(faux_amis || []), version]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const fields = ['name','language_pair','jurisdiction','legal_area','terms','faux_amis','coverage_score','quality_score','version','status'];
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

router.get('/by-session/:langPair', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE language_pair=$1 AND deleted_at IS NULL ORDER BY id DESC`, [req.params.langPair]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/by-jurisdiction/:jurisdiction', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE jurisdiction=$1 AND deleted_at IS NULL ORDER BY id DESC`, [req.params.jurisdiction]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`INSERT INTO ${TABLE} (name,language_pair,jurisdiction,legal_area,version) VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [b.name, b.language_pair, b.jurisdiction, b.legal_area, b.version])
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
      db.query(`UPDATE ${TABLE} SET quality_score=$1,status=$2,updated_at=NOW() WHERE id=$3 AND deleted_at IS NULL RETURNING *`, [b.quality_score, b.status, b.id])
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
    if (req.query.jurisdiction) { where.push(`jurisdiction=$${vals.length+1}`); vals.push(req.query.jurisdiction); }
    if (req.query.legal_area) { where.push(`legal_area=$${vals.length+1}`); vals.push(req.query.legal_area); }
    const clause = where.length ? `AND ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL ${clause}`, vals);
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const q = `%${req.query.q || ''}%`;
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL AND (name ILIKE $1 OR jurisdiction ILIKE $1 OR legal_area ILIKE $1 OR language_pair ILIKE $1) ORDER BY id DESC LIMIT 50`, [q]);
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
    const r = await db.query(`SELECT id,name,version,jurisdiction,quality_score,updated_at FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    res.json({ id: req.params.id, history: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/export-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,name,language_pair,jurisdiction,legal_area,version,coverage_score,quality_score,created_at FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC`);
    const header = 'id,name,language_pair,jurisdiction,legal_area,version,coverage_score,quality_score,created_at';
    const rows = r.rows.map(row => `${row.id},"${row.name||''}","${row.language_pair||''}","${row.jurisdiction||''}","${row.legal_area||''}","${row.version||''}",${row.coverage_score||''},${row.quality_score||''},"${row.created_at||''}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="legal-glossary-${Date.now()}.csv"`);
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
      await db.query(`INSERT INTO ${TABLE} (name,language_pair,jurisdiction,legal_area,version) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, [row.name, row.language_pair, row.jurisdiction, row.legal_area, row.version]);
      imported++;
    }
    res.json({ imported });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats-summary', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT legal_area, jurisdiction, COUNT(*) as count, AVG(coverage_score) as avg_coverage, AVG(quality_score) as avg_quality FROM ${TABLE} WHERE deleted_at IS NULL GROUP BY legal_area, jurisdiction ORDER BY count DESC LIMIT 20`);
    res.json({ stats: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI verbs (16) ─────────────────────────────────────────────────────────
const AI_VERBS = [
  { verb: 'detect-untranslatable-legal-term', prompt: (b) => `Identify untranslatable legal terms in: "${b.term || b.source_text}" for language pair ${b.language_pair}, jurisdiction ${b.jurisdiction}. Return: untranslatable_terms[], handling_strategies[].` },
  { verb: 'suggest-jurisdiction-match', prompt: (b) => `Suggest best jurisdiction match for legal term: "${b.term}" in language pair ${b.language_pair}. Legal area: ${b.legal_area}. Return: jurisdiction, confidence, caveats[].` },
  { verb: 'classify-doctrine-vs-procedural', prompt: (b) => `Classify legal term "${b.term}" as doctrinal or procedural. Return: classification (doctrine/procedural/both), legal_area, significance.` },
  { verb: 'predict-legal-meaning-shift', prompt: (b) => `Predict legal meaning shift risk for term "${b.term}" when translated across ${b.language_pair} between jurisdictions. Return: shift_risk (low/medium/high), examples[], mitigation[].` },
  { verb: 'recommend-glossary-addition', prompt: (b) => `Recommend new terms for legal glossary pack "${b.name}" (${b.legal_area}, ${b.jurisdiction}, ${b.language_pair}). Return: recommended_terms[] with term, source_form, target_form, reason.` },
  { verb: 'generate-back-translation-test', prompt: (b) => `Generate back-translation test for legal term: "${b.term}" in ${b.language_pair}. Return: source_term, translated_term, back_translated, equivalence_score, discrepancies[].` },
  { verb: 'summarize-glossary-usage', prompt: (b) => `Summarize usage of legal glossary pack "${b.name}": coverage ${b.coverage_score}, quality ${b.quality_score}. Return: usage_summary, top_terms[], key_issues[].` },
  { verb: 'score-glossary-quality', prompt: (b) => `Score quality of legal glossary "${b.name}" with coverage ${b.coverage_score}, jurisdiction ${b.jurisdiction}. Return: quality_score (0-1), breakdown{}, improvement_actions[].` },
  { verb: 'validate-legal-equivalence', prompt: (b) => `Validate legal equivalence between source term "${b.source_term}" and target term "${b.target_term}" across ${b.language_pair} and jurisdiction ${b.jurisdiction}. Return: is_equivalent (bool), confidence, jurisdiction_caveats[].` },
  { verb: 'suggest-cross-jurisdiction-term', prompt: (b) => `Suggest cross-jurisdiction equivalents for legal term "${b.term}" (${b.jurisdiction}, ${b.legal_area}) in language pair ${b.language_pair}. Return: equivalents[] with jurisdiction, term, notes.` },
  { verb: 'detect-faux-ami', prompt: (b) => `Detect faux amis (false friends) between ${b.language_pair} for legal term: "${b.term}". Return: is_faux_ami (bool), misleading_similarity, correct_usage[].` },
  { verb: 'recommend-loanword-strategy', prompt: (b) => `Recommend strategy for legal term "${b.term}" in ${b.language_pair}: loanword, calque, or descriptive translation? Jurisdiction: ${b.jurisdiction}. Return: strategy, rationale, examples[].` },
  { verb: 'classify-legal-area', prompt: (b) => `Classify the legal area for term: "${b.term}" in jurisdiction ${b.jurisdiction}. Return: primary_area, sub_area, practice_context[].` },
  { verb: 'predict-misinterpretation-risk', prompt: (b) => `Predict misinterpretation risk for legal term "${b.term}" in ${b.language_pair}, jurisdiction ${b.jurisdiction}. Return: risk_level, risk_scenarios[], protective_measures[].` },
  { verb: 'generate-glossary-doc', prompt: (b) => `Generate documentation for legal glossary pack "${b.name}" (${b.legal_area}, ${b.jurisdiction}, ${b.language_pair}). Return: title, description, scope, usage_notes, version_history.` },
  { verb: 'suggest-glossary-versioning', prompt: (b) => `Suggest a versioning strategy for legal glossary "${b.name}" given jurisdiction ${b.jurisdiction} and language pair ${b.language_pair}. Return: version_scheme, update_triggers[], deprecation_policy.` }
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
