require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Make pool available to routes
app.set('db', pool);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/translators', require('./routes/translators'));
app.use('/api/languages', require('./routes/languages'));
app.use('/api/glossary', require('./routes/glossary'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/files', require('./routes/files'));
app.use('/api/ai/translate', require('./routes/ai-translate'));
app.use('/api/ai/localize', require('./routes/ai-localize'));
app.use('/api/ai/grammar', require('./routes/ai-grammar'));
app.use('/api/ai/terminology', require('./routes/ai-terminology'));
app.use('/api/ai/tm', require('./routes/ai-translation-memory'));
app.use('/api/ai/quality', require('./routes/ai-quality'));
app.use('/api/ai/cultural', require('./routes/ai-cultural'));
app.use('/api/ai/seo', require('./routes/ai-seo'));
app.use('/api/ai/back-translation', require('./routes/ai-back-translation'));
app.use('/api/ai/sentiment', require('./routes/ai-sentiment'));
app.use('/api/ai/lang-detect', require('./routes/ai-lang-detect'));
app.use('/api/ai/readability', require('./routes/ai-readability'));
app.use('/api/ai/style-transfer', require('./routes/ai-style-transfer'));
app.use('/api/ai/summarize', require('./routes/ai-summarize'));
app.use('/api/ai/brand-voice', require('./routes/ai-brand-voice'));
app.use('/api/ai/subtitles', require('./routes/ai-subtitles'));
app.use('/api/ai/doc-compare', require('./routes/ai-doc-compare'));
app.use('/api/ai/competitor', require('./routes/ai-competitor'));
app.use('/api/ai/project-analyzer', require('./routes/ai-project-analyzer'));
app.use('/api/ai/client-insights', require('./routes/ai-client-insights'));
app.use('/api/ai/translator-matcher', require('./routes/ai-translator-matcher'));
app.use('/api/ai/glossary-gen', require('./routes/ai-glossary-gen'));
app.use('/api/ai/order-optimizer', require('./routes/ai-order-optimizer'));
app.use('/api/ai/bias-check', require('./routes/ai-bias-check'));
app.use('/api/ai/invoice-analyzer', require('./routes/ai-invoice-analyzer'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
