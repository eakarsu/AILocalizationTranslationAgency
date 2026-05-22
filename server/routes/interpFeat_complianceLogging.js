// interpFeat_complianceLogging.js — Real-Time Interpretation: HIPAA-Grade Compliance Logging
// Mount: /api/interp/compliance-logging
// 18 CRUD + 16 AI verbs

const express = require('express');
const router = express.Router();
const { ensureInterpTables } = require('../models/interpretation');
const TABLE = 'interp_compliance_logs';

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
          { role: 'system', content: `You are a HIPAA compliance and healthcare data privacy expert for interpretation audit logging. ${systemNote || ''}` },
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
    const { session_id, event_type, user_id, phrase_text, phi_pii_detected, disclosure_type, retention_policy, audit_meta } = req.body;
    const r = await db.query(
      `INSERT INTO ${TABLE} (session_id,event_type,user_id,phrase_text,phi_pii_detected,disclosure_type,retention_policy,audit_meta) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [session_id, event_type, user_id, phrase_text, phi_pii_detected || false, disclosure_type, retention_policy, JSON.stringify(audit_meta || {})]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id(\\d+)', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const fields = ['event_type','phrase_text','redacted_text','phi_pii_detected','hipaa_violation','disclosure_type','retention_policy','encryption_verified','tamper_detected','compliance_score','breach_risk','audit_meta'];
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
    // Soft delete — compliance logs must not be hard-deleted
    const r = await db.query(`UPDATE ${TABLE} SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING id`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ soft_deleted: true, id: r.rows[0].id, note: 'HIPAA: hard delete not permitted; record marked deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/by-session/:sessionId', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE session_id=$1 AND deleted_at IS NULL ORDER BY id ASC`, [req.params.sessionId]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/by-user/:userId', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE user_id=$1 AND deleted_at IS NULL ORDER BY id DESC LIMIT 100`, [req.params.userId]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/batch', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] required' });
    const results = await Promise.all(items.map(b =>
      db.query(`INSERT INTO ${TABLE} (session_id,event_type,user_id,phrase_text,phi_pii_detected) VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [b.session_id, b.event_type, b.user_id, b.phrase_text, b.phi_pii_detected || false])
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
      db.query(`UPDATE ${TABLE} SET compliance_score=$1,hipaa_violation=$2,updated_at=NOW() WHERE id=$3 AND deleted_at IS NULL RETURNING *`, [b.compliance_score, b.hipaa_violation, b.id])
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
    res.json({ soft_deleted: true, ids, note: 'HIPAA: hard delete not permitted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/count', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const where = []; const vals = [];
    if (req.query.event_type) { where.push(`event_type=$${vals.length+1}`); vals.push(req.query.event_type); }
    if (req.query.phi_pii_detected) { where.push(`phi_pii_detected=$${vals.length+1}`); vals.push(req.query.phi_pii_detected === 'true'); }
    if (req.query.hipaa_violation) { where.push(`hipaa_violation=$${vals.length+1}`); vals.push(req.query.hipaa_violation === 'true'); }
    const clause = where.length ? `AND ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL ${clause}`, vals);
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const q = `%${req.query.q || ''}%`;
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE deleted_at IS NULL AND (event_type ILIKE $1 OR disclosure_type ILIKE $1 OR retention_policy ILIKE $1) ORDER BY id DESC LIMIT 50`, [q]);
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
    const r = await db.query(`SELECT id,event_type,phi_pii_detected,hipaa_violation,compliance_score,updated_at FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    res.json({ id: req.params.id, history: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/export-csv', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT id,session_id,event_type,user_id,phi_pii_detected,hipaa_violation,disclosure_type,compliance_score,created_at FROM ${TABLE} WHERE deleted_at IS NULL ORDER BY id DESC`);
    const header = 'id,session_id,event_type,user_id,phi_pii_detected,hipaa_violation,disclosure_type,compliance_score,created_at';
    const rows = r.rows.map(row => `${row.id},${row.session_id||''},"${row.event_type||''}",${row.user_id||''},${row.phi_pii_detected||false},${row.hipaa_violation||false},"${row.disclosure_type||''}",${row.compliance_score||''},"${row.created_at||''}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="compliance-logs-${Date.now()}.csv"`);
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
      await db.query(`INSERT INTO ${TABLE} (session_id,event_type,user_id,phi_pii_detected) VALUES($1,$2,$3,$4)`, [row.session_id, row.event_type, row.user_id, row.phi_pii_detected || false]);
      imported++;
    }
    res.json({ imported });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats-summary', async (req, res) => {
  try {
    const db = req.app.get('db'); await db_init(db);
    const r = await db.query(`SELECT event_type, COUNT(*) as count, SUM(CASE WHEN phi_pii_detected THEN 1 ELSE 0 END) as phi_count, SUM(CASE WHEN hipaa_violation THEN 1 ELSE 0 END) as violation_count, AVG(compliance_score) as avg_compliance FROM ${TABLE} WHERE deleted_at IS NULL GROUP BY event_type ORDER BY count DESC`);
    res.json({ stats: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI verbs (16) ─────────────────────────────────────────────────────────
const AI_VERBS = [
  { verb: 'classify-phi-pii-content', prompt: (b) => `Classify PHI/PII content in interpreted phrase: "${(b.phrase_text||'').slice(0,400)}". Return: contains_phi (bool), phi_types[], pii_types[], sensitivity_level (low/medium/high/critical).` },
  { verb: 'redact-phi-in-log', prompt: (b) => `Redact PHI/PII from this audit log phrase: "${(b.phrase_text||'').slice(0,400)}". Return: redacted_text, redacted_spans[] with start, end, type, replacement.` },
  { verb: 'detect-hipaa-violation', prompt: (b) => `Detect HIPAA violation risk in event: type "${b.event_type}", phi_detected: ${b.phi_pii_detected}, disclosure_type: "${b.disclosure_type}". Return: violation_detected (bool), rule_violated, severity, recommendation.` },
  { verb: 'predict-audit-finding', prompt: (b) => `Predict likely audit findings for compliance log entry: event_type "${b.event_type}", phi ${b.phi_pii_detected}, hipaa_violation ${b.hipaa_violation}. Return: findings[], risk_level, remediation[].` },
  { verb: 'recommend-retention-policy', prompt: (b) => `Recommend data retention policy for: event_type "${b.event_type}", phi_detected ${b.phi_pii_detected}, disclosure_type "${b.disclosure_type}". Return: retention_period, policy_name, regulatory_basis, purge_procedure.` },
  { verb: 'generate-compliance-report', prompt: (b) => `Generate a HIPAA compliance report for session ${b.session_id}. Stats: ${JSON.stringify(b)}. Return: report_title, executive_summary, findings[], violations[], recommendations[].` },
  { verb: 'summarize-access-events', prompt: (b) => `Summarize access events for session ${b.session_id}: ${JSON.stringify(b.audit_meta||{})}. Return: event_count, unique_users, phi_access_count, anomalies[].` },
  { verb: 'score-log-completeness', prompt: (b) => `Score completeness of compliance log entry: ${JSON.stringify(b)}. Return: completeness_score (0-1), missing_fields[], critical_gaps[].` },
  { verb: 'validate-encryption-at-rest', prompt: (b) => `Validate encryption-at-rest status for log entry: encryption_verified ${b.encryption_verified}, phi ${b.phi_pii_detected}. Return: is_compliant (bool), encryption_gaps[], required_actions[].` },
  { verb: 'suggest-additional-audit-field', prompt: (b) => `Suggest additional audit fields for: event_type "${b.event_type}", current fields ${JSON.stringify(Object.keys(b))}. Return: suggested_fields[] with field_name, rationale, regulatory_requirement.` },
  { verb: 'detect-tamper-attempt', prompt: (b) => `Detect signs of tamper attempt in log entry id ${b.id || b.log_id}: ${JSON.stringify(b.audit_meta||{})}. Return: tamper_detected (bool), indicators[], confidence.` },
  { verb: 'recommend-baa-coverage', prompt: (b) => `Recommend Business Associate Agreement coverage for interpretation session: event_type "${b.event_type}", phi ${b.phi_pii_detected}, disclosure "${b.disclosure_type}". Return: baa_required (bool), covered_entities[], baa_scope[].` },
  { verb: 'classify-disclosure-type', prompt: (b) => `Classify HIPAA disclosure type for: event "${b.event_type}", context ${JSON.stringify(b.audit_meta||{})}. Return: disclosure_type, permitted (bool), authorization_required (bool), documentation_needed[].` },
  { verb: 'predict-breach-impact', prompt: (b) => `Predict breach impact if phi/pii data in this log were exposed: phi ${b.phi_pii_detected}, sensitivity "${b.breach_risk}", session ${b.session_id}. Return: impact_level (low/medium/high/critical), affected_individuals_estimate, notification_required (bool), regulatory_penalties[].` },
  { verb: 'generate-breach-notification-draft', prompt: (b) => `Draft a HIPAA breach notification for potential exposure in session ${b.session_id}: ${JSON.stringify(b)}. Return: notification_draft with subject, body, required_elements[], timeline.` },
  { verb: 'score-compliance-posture', prompt: (b) => `Score overall compliance posture for audit log data: phi_count ${b.phi_count}, violation_count ${b.violation_count}, compliance_score ${b.compliance_score}. Return: posture_score (0-100), grade (A-F), key_risks[], priority_actions[].` }
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
