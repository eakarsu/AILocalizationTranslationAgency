// interpFeat_medicalGlossaryPack.js — Real-Time Interpretation: Medical Glossary Packs
// Mount: /api/interp/medical-glossary-pack
// 18 CRUD + 16 AI verbs

const express = require('express');
const router = express.Router();
const { ensureInterpTables } = require('../models/interpretation');
const TABLE = 'interp_medical_glossary_packs';

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
          { role: 'system', content: `You are a medical terminology expert for multilingual interpretation. ${systemNote || ''}` },
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
    const { name, language_pair, specialty_domain, terms, icd_snomed_mappings, version } = req.body;
    const r = await db.query(
      `INSERT INTO ${TABLE} (name,language_pair,specialty_domain,terms,icd_snomed_mappings,version) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, language_pair, specialty_domain, JSON.stringify(terms || []), JSON.stringify(icd_snomed_mappings || {}), version]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const fields = ['name','language_pair','specialty_domain','terms','icd_snomed_mappings','coverage_score','quality_score','version','status'];
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

router.get('/by-specialty/:domain', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE specialty_domain=$1 AND deleted_at IS NULL ORDER BY id DESC`, [req.params.domain]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`INSERT INTO ${TABLE} (name,language_pair,specialty_domain,version) VALUES($1,$2,$3,$4) RETURNING *`,
        [b.name, b.language_pair, b.specialty_domain, b.version])
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
    if (req.query.specialty_domain) { where.push(`specialty_domain=$${vals.length+1}`); vals.push(req.query.specialty_domain); }
    if (req.query.language_pair) { where.push(`language_pair=$${vals.length+1}`); vals.push(req.query.language_pair); }
    const clause = where.length ? `AND ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL ${clause}`, vals);
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const q = `%${req.query.q || ''}%`;
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL AND (name ILIKE $1 OR specialty_domain ILIKE $1 OR language_pair ILIKE $1) ORDER BY id DESC LIMIT 50`, [q]);
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
    const r = await db.query(`SELECT id,name,version,quality_score,updated_at FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    res.json({ id: req.params.id, history: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/export-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,name,language_pair,specialty_domain,version,coverage_score,quality_score,created_at FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC`);
    const header = 'id,name,language_pair,specialty_domain,version,coverage_score,quality_score,created_at';
    const rows = r.rows.map(row => `${row.id},"${row.name||''}","${row.language_pair||''}","${row.specialty_domain||''}","${row.version||''}",${row.coverage_score||''},${row.quality_score||''},"${row.created_at||''}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="medical-glossary-${Date.now()}.csv"`);
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
      await db.query(`INSERT INTO ${TABLE} (name,language_pair,specialty_domain,version) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`, [row.name, row.language_pair, row.specialty_domain, row.version]);
      imported++;
    }
    res.json({ imported });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats-summary', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT specialty_domain, COUNT(*) as count, AVG(coverage_score) as avg_coverage, AVG(quality_score) as avg_quality FROM ${TABLE} WHERE deleted_at IS NULL GROUP BY specialty_domain ORDER BY count DESC`);
    res.json({ stats: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI verbs (16) ─────────────────────────────────────────────────────────
const AI_VERBS = [
  { verb: 'detect-untranslatable-medical-term', prompt: (b) => `Identify untranslatable medical terms in: "${b.term || b.source_text}" for language pair ${b.language_pair}. Return: untranslatable_terms[], handling_options[].` },
  { verb: 'suggest-icd-snomed-mapping', prompt: (b) => `Suggest ICD-10 or SNOMED CT mapping for medical term: "${b.term}", specialty: ${b.specialty_domain}, language: ${b.language}. Return: icd_codes[], snomed_codes[], confidence.` },
  { verb: 'classify-term-acuity', prompt: (b) => `Classify clinical acuity of medical term: "${b.term}". Return: acuity_level (critical/high/medium/low), clinical_significance, interpretation_priority.` },
  { verb: 'predict-glossary-coverage-gap', prompt: (b) => `Predict coverage gaps in medical glossary "${b.name}" (${b.specialty_domain}, ${b.language_pair}). Coverage score: ${b.coverage_score}. Return: gap_areas[], estimated_missing_terms, priority_additions[].` },
  { verb: 'recommend-glossary-addition', prompt: (b) => `Recommend terms to add to medical glossary for specialty "${b.specialty_domain}", language pair ${b.language_pair}. Return: recommended_terms[] with term, source_lang_form, target_lang_form, reason.` },
  { verb: 'generate-back-translation-test', prompt: (b) => `Generate a back-translation test for medical term: "${b.term}" in ${b.language_pair}. Return: source_term, translated_term, back_translated, equivalence_score, discrepancies[].` },
  { verb: 'summarize-glossary-usage', prompt: (b) => `Summarize usage of medical glossary pack "${b.name}": coverage ${b.coverage_score}, quality ${b.quality_score}, specialty ${b.specialty_domain}. Return: usage_summary, top_terms[], recommendations[].` },
  { verb: 'score-glossary-quality', prompt: (b) => `Score the quality of medical glossary "${b.name}" with ${JSON.stringify(b.terms||[])} terms, coverage ${b.coverage_score}. Return: quality_score (0-1), breakdown{}, improvement_actions[].` },
  { verb: 'validate-medical-equivalence', prompt: (b) => `Validate medical equivalence between source term "${b.source_term}" and target term "${b.target_term}" for language pair ${b.language_pair}. Return: is_equivalent (bool), confidence, caveats[].` },
  { verb: 'suggest-cross-lang-term', prompt: (b) => `Suggest cross-language medical term variants for: "${b.term}", specialty ${b.specialty_domain}, beyond language pair ${b.language_pair}. Return: variants[] with lang, term, notes.` },
  { verb: 'detect-false-cognate', prompt: (b) => `Detect false medical cognates between ${b.language_pair} for term: "${b.term}". Return: is_false_cognate (bool), explanation, correct_translation.` },
  { verb: 'recommend-prefer-loanword-vs-translation', prompt: (b) => `Should medical term "${b.term}" be kept as a loanword or translated in ${b.language_pair}? Specialty: ${b.specialty_domain}. Return: recommendation (loanword/translate/contextual), rationale.` },
  { verb: 'classify-specialty-domain', prompt: (b) => `Classify the medical specialty domain for term: "${b.term}". Return: primary_specialty, sub_specialty, related_domains[].` },
  { verb: 'predict-translation-confusion', prompt: (b) => `Predict translation confusion risk for medical term "${b.term}" in language pair ${b.language_pair}. Return: confusion_risk (low/medium/high), confusion_scenarios[], mitigation[].` },
  { verb: 'generate-glossary-doc', prompt: (b) => `Generate documentation for medical glossary pack "${b.name}" covering specialty ${b.specialty_domain}, language pair ${b.language_pair}. Return: title, description, usage_guidelines, version_notes.` },
  { verb: 'suggest-glossary-merge', prompt: (b) => `Suggest which medical glossary packs could be merged with pack "${b.name}" (${b.specialty_domain}, ${b.language_pair}). Return: merge_candidates[], merge_benefit, overlap_estimate_pct.` }
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
