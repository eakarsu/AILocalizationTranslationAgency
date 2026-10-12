require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { validateRuntime } = require('./governance/runtime');
const buildGovernanceRouter = require('./governance/router');
const { createProviderGate } = require('./governance/providerGate');

validateRuntime();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
const allowedOrigins = String(process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((value) => value.trim()).filter(Boolean);
app.use(cors({ origin:(origin,callback)=>!origin||allowedOrigins.includes(origin)?callback(null,true):callback(new Error('Origin not allowed by CORS')),credentials:true }));
app.use(express.json({ limit: '10mb' }));
app.use(createProviderGate(['/api/ai','/api/interp','/api/translator-matcher','/api/qa-stream','/api/multi-modal-pipeline','/api/brand-voice-enforcer','/api/vertical-tm-manager']));

// Database pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Make pool available to routes
app.set('db', pool);

async function initializeRuntime() {
  if (process.env.MIGRATE_ON_START !== 'true') return;
  const email = process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Runtime admin credentials are required');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ai_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      endpoint VARCHAR(100),
      input_data JSONB,
      result JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
    [process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator', email, passwordHash]
  );
}

const authMiddleware = require('./middleware/auth');
const { aiRateLimiter } = require('./middleware/rateLimiter');

// Public routes (no auth required)
app.use('/api/auth', require('./routes/auth'));

// Apply auth middleware to all non-auth, non-health API routes
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path === '/health') return next();
  return authMiddleware(req, res, next);
});

// CRUD routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/translators', require('./routes/translators'));
app.use('/api/languages', require('./routes/languages'));
app.use('/api/glossary', require('./routes/glossary'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/files', require('./routes/files'));

// AI routes (rate-limited)
app.use('/api/ai/translate', aiRateLimiter, require('./routes/ai-translate'));
app.use('/api/ai/localize', aiRateLimiter, require('./routes/ai-localize'));
app.use('/api/ai/grammar', aiRateLimiter, require('./routes/ai-grammar'));
app.use('/api/ai/terminology', aiRateLimiter, require('./routes/ai-terminology'));
app.use('/api/ai/tm', aiRateLimiter, require('./routes/ai-translation-memory'));
app.use('/api/ai/quality', aiRateLimiter, require('./routes/ai-quality'));
app.use('/api/ai/cultural', aiRateLimiter, require('./routes/ai-cultural'));
app.use('/api/ai/seo', aiRateLimiter, require('./routes/ai-seo'));
app.use('/api/ai/back-translation', aiRateLimiter, require('./routes/ai-back-translation'));
app.use('/api/ai/sentiment', aiRateLimiter, require('./routes/ai-sentiment'));
app.use('/api/ai/lang-detect', aiRateLimiter, require('./routes/ai-lang-detect'));
app.use('/api/ai/readability', aiRateLimiter, require('./routes/ai-readability'));
app.use('/api/ai/style-transfer', aiRateLimiter, require('./routes/ai-style-transfer'));
app.use('/api/ai/summarize', aiRateLimiter, require('./routes/ai-summarize'));
app.use('/api/ai/brand-voice', aiRateLimiter, require('./routes/ai-brand-voice'));
app.use('/api/ai/subtitles', aiRateLimiter, require('./routes/ai-subtitles'));
app.use('/api/ai/doc-compare', aiRateLimiter, require('./routes/ai-doc-compare'));
app.use('/api/ai/competitor', aiRateLimiter, require('./routes/ai-competitor'));
app.use('/api/ai/project-analyzer', aiRateLimiter, require('./routes/ai-project-analyzer'));
app.use('/api/ai/client-insights', aiRateLimiter, require('./routes/ai-client-insights'));
app.use('/api/ai/translator-matcher', aiRateLimiter, require('./routes/ai-translator-matcher'));
app.use('/api/ai/glossary-gen', aiRateLimiter, require('./routes/ai-glossary-gen'));
app.use('/api/ai/order-optimizer', aiRateLimiter, require('./routes/ai-order-optimizer'));
app.use('/api/ai/bias-check', aiRateLimiter, require('./routes/ai-bias-check'));
app.use('/api/ai/invoice-analyzer', aiRateLimiter, require('./routes/ai-invoice-analyzer'));
app.use('/api/ai/generate-quote', aiRateLimiter, require('./routes/ai-generate-quote'));
app.use('/api/ai-results', require('./routes/ai-results'));
app.use('/api/terminology-drift-qa', require('./routes/terminologyDriftQa'));
app.use('/api/governed-localization-deliveries', buildGovernanceRouter(pool));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


// Advisory AI reports only; native execution and approval routes stay unchanged.
const aiWorkspaceSupport = require("./aiWorkspaceAdapters.cjs");
const aiWorkspaceDatabase = pool;
app.use('/api/report-workspace', require("./aiWorkspace.cjs").createAIWorkspaceRouter({
  pool: aiWorkspaceDatabase, authenticateToken: require("./middleware/auth.js"),
  aiRateLimiter: aiWorkspaceSupport.createWorkspaceLimiter(), features: require("./aiWorkspaceFeatures.json"),
}));
initializeRuntime()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => {
    console.error('Runtime initialization failed:', error.message);
    process.exit(1);
  });

// === BATCH 05 AUTO-MOUNT (custom feature suggestions) ===
app.use('/api/translator-matcher', require('./routes/translator-matcher'));
app.use('/api/qa-stream', require('./routes/qa-stream'));
app.use('/api/multi-modal-pipeline', require('./routes/multi-modal-pipeline'));
app.use('/api/brand-voice-enforcer', require('./routes/brand-voice-enforcer'));
app.use('/api/vertical-tm-manager', require('./routes/vertical-tm-manager'));

// Generated gap routes are quarantined: no mounts until durable provider contracts and acceptance tests exist.

// === Real-Time Interpretation Feature Mounts ===
try { app.use('/api/interp/streaming-asr', require('./routes/interpFeat_streamingAsr')); } catch(e) { console.error('interp mount fail streaming-asr:', e.message); }
try { app.use('/api/interp/streaming-mt', require('./routes/interpFeat_streamingMt')); } catch(e) { console.error('interp mount fail streaming-mt:', e.message); }
try { app.use('/api/interp/streaming-tts', require('./routes/interpFeat_streamingTts')); } catch(e) { console.error('interp mount fail streaming-tts:', e.message); }
try { app.use('/api/interp/medical-glossary-pack', require('./routes/interpFeat_medicalGlossaryPack')); } catch(e) { console.error('interp mount fail medical-glossary-pack:', e.message); }
try { app.use('/api/interp/legal-glossary-pack', require('./routes/interpFeat_legalGlossaryPack')); } catch(e) { console.error('interp mount fail legal-glossary-pack:', e.message); }
try { app.use('/api/interp/dialect-adaptation', require('./routes/interpFeat_dialectAdaptation')); } catch(e) { console.error('interp mount fail dialect-adaptation:', e.message); }
try { app.use('/api/interp/speaker-diarization', require('./routes/interpFeat_speakerDiarization')); } catch(e) { console.error('interp mount fail speaker-diarization:', e.message); }
try { app.use('/api/interp/compliance-logging', require('./routes/interpFeat_complianceLogging')); } catch(e) { console.error('interp mount fail compliance-logging:', e.message); }
// === End Real-Time Interpretation Mounts ===

// Serve client build (when available) so single port hosts UI + API
const path = require('path');
const fs = require('fs');
const _buildDir = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(_buildDir)) {
  app.use(express.static(_buildDir));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(_buildDir, 'index.html')));
}
