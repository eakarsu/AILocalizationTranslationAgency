const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createWorkflow } = require('./workflowCore');
const { validateRuntime } = require('./runtime');
const config = require('./config');
const workflow = createWorkflow(config);
const headers = { 'x-tenant-id': 'tenant-a', 'idempotency-key': 'request-a' };
const accepted = { formatType:'document',sourceVersion:'source-v1',placeholderCount:2,placeholderPreserved:true,locale:'fr-FR',terminologyVersion:'terms-v2',qaErrorCount:0,policyVersion:'policy-v1' };

test('workflow topology and connector declarations are internally valid', () => {
  assert.ok(config.states.includes(config.initialState));
  assert.ok(config.transitions.length > 2);
  assert.ok(config.connectors.length > 2);
  for (const rule of config.transitions) {
    assert.ok(config.states.includes(rule.from));
    assert.ok(config.states.includes(rule.to));
    assert.ok(rule.roles.length > 0);
  }
});

test('tenant, idempotency, actor and create-role boundaries fail closed', () => {
  assert.throws(() => workflow.context({}, { id:'actor-a',role:config.createRoles[0] }), /X-Tenant-Id/);
  const ctx = workflow.context(headers, { id:'actor-a',role:config.createRoles[0] });
  const record = workflow.createCase({ subjectRef:'project-17',policyVersion:'policy-v1',effectiveAt:'2026-07-18T00:00:00Z',sourceSnapshot:{version:'v1'} }, ctx);
  assert.equal(record.tenantId, 'tenant-a');
  assert.equal(record.state, config.initialState);
  assert.throws(() => workflow.createCase({ subjectRef:'project-17',policyVersion:'policy-v1',effectiveAt:'2026-07-18T00:00:00Z' }, { ...ctx,role:'visitor' }), /Role cannot create/);
});

test('evidence accepts only digested opaque references', () => {
  const item = workflow.evidence({ kind:config.evidenceKinds[0],sourceRef:'vault:source-17',sourceVersion:'v1',sha256:'a'.repeat(64),capturedAt:'2026-07-18T01:00:00Z',metadata:{format:'xliff'} });
  assert.equal(item.sha256, 'a'.repeat(64));
  assert.throws(() => workflow.evidence({ kind:config.evidenceKinds[0],sourceRef:'vault:x',sourceVersion:'v1',sha256:'bad',capturedAt:'2026-07-18T01:00:00Z' }), /sha256/);
  assert.throws(() => workflow.evidence({ kind:config.evidenceKinds[0],sourceRef:'vault:x',sourceVersion:'v1',sha256:'b'.repeat(64),capturedAt:'2026-07-18T01:00:00Z',metadata:{raw_content:'secret'} }), /opaque references/);
});

test('localization assessment is deterministic, non-executing and conservative', () => {
  const ctx = workflow.context(headers, { id:'engineer-a',role:'localization_engineer' });
  assert.equal(workflow.deterministicAssessment({}, ctx).disposition, 'insufficient_evidence');
  const good = workflow.deterministicAssessment(accepted, ctx);
  assert.equal(good.disposition, 'human_locale_acceptance_required');
  assert.equal(good.automatedDecision, false);
  assert.equal(good.deliveryDecision, null);
  const held = workflow.deterministicAssessment({ ...accepted,placeholderPreserved:false }, ctx);
  assert.equal(held.disposition, 'linguistic_or_format_hold');
});

test('state changes enforce evidence, versions, RBAC and dual control', () => {
  const first = config.transitions[0];
  const ctx = workflow.context(headers, { id:'actor-b',role:first.roles[0] });
  const record = { state:first.from,version:1,evidenceCount:0,createdBy:'actor-a',lastActorId:null };
  assert.throws(() => workflow.transition(record,{ action:first.action,expectedVersion:1,reason:'validated source format' },ctx), /evidence/);
  assert.throws(() => workflow.transition({ ...record,evidenceCount:1 },{ action:first.action,expectedVersion:2,reason:'validated source format' },ctx), /changed/);
  assert.equal(workflow.transition({ ...record,evidenceCount:1 },{ action:first.action,expectedVersion:1,reason:'validated source format' },ctx).to, first.to);
  const dual = config.transitions.find((rule) => rule.dualControl);
  const dualCtx = workflow.context(headers, { id:'actor-b',role:dual.roles[0] });
  assert.throws(() => workflow.transition({ state:dual.from,version:3,evidenceCount:1,createdBy:'actor-a',lastActorId:'actor-b' },{ action:dual.action,expectedVersion:3,reason:'independent review complete' },dualCtx), /second person/);
});

test('runtime configuration rejects weak secrets and unsafe production modes', () => {
  assert.throws(() => validateRuntime({ NODE_ENV:'test',JWT_SECRET:'short' }), /JWT_SECRET/);
  assert.throws(() => validateRuntime({ NODE_ENV:'production',JWT_SECRET:'x'.repeat(40),DATABASE_URL:'postgres://configured',CORS_ORIGINS:'*' }), /allowlist/);
  assert.throws(() => validateRuntime({ NODE_ENV:'production',JWT_SECRET:'x'.repeat(40),DATABASE_URL:'postgres://configured',CORS_ORIGINS:'https://client.example',ALLOW_MOCK_PROVIDERS:'true' }), /prohibited/);
  assert.equal(validateRuntime({ NODE_ENV:'test',JWT_SECRET:'x'.repeat(40) }), true);
});

test('migration and launcher preserve append-only and nondestructive boundaries', () => {
  const root = path.resolve(__dirname, '..', '..');
  const migration = fs.readFileSync(path.join(root,'server/migrations/001_governed_localization.sql'),'utf8');
  const launcher = fs.readFileSync(path.join(root,'start.sh'),'utf8');
  assert.match(migration, /governed_tenant_memberships/);
  assert.match(migration, /governed_connector_failures/);
  assert.match(migration, /append-only/);
  assert.doesNotMatch(launcher, /kill\s+-9|pkill|dropdb|createdb|npm\s+install|seed\.js|psql\s+.*-f/);
});
