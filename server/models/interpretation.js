// interpretation.js — SQL schema definitions for Real-Time Interpretation feature
// Each table is created via CREATE TABLE IF NOT EXISTS on first route access.
// Called from interpFeat_* route files via ensureInterpTables(db).

const TABLES = {
  interp_asr_sessions: `
    CREATE TABLE IF NOT EXISTS interp_asr_sessions (
      id SERIAL PRIMARY KEY,
      session_token VARCHAR(255) UNIQUE,
      user_id INTEGER,
      language_code VARCHAR(20),
      audio_format VARCHAR(50),
      sample_rate INTEGER,
      status VARCHAR(50) DEFAULT 'active',
      partial_transcript TEXT,
      final_transcript TEXT,
      confidence_score FLOAT,
      noise_level VARCHAR(50),
      domain_model VARCHAR(100),
      speaker_accent VARCHAR(100),
      vad_segments JSONB,
      corrections JSONB,
      session_meta JSONB,
      deleted_at TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

  interp_mt_segments: `
    CREATE TABLE IF NOT EXISTS interp_mt_segments (
      id SERIAL PRIMARY KEY,
      session_id INTEGER,
      source_lang VARCHAR(20),
      target_lang VARCHAR(20),
      source_text TEXT,
      translated_text TEXT,
      post_edit_text TEXT,
      domain VARCHAR(100),
      quality_score FLOAT,
      latency_ms INTEGER,
      glossary_pack_id INTEGER,
      context_window INTEGER,
      error_type VARCHAR(100),
      mt_meta JSONB,
      deleted_at TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

  interp_tts_sessions: `
    CREATE TABLE IF NOT EXISTS interp_tts_sessions (
      id SERIAL PRIMARY KEY,
      session_token VARCHAR(255),
      user_id INTEGER,
      voice_id VARCHAR(100),
      voice_style VARCHAR(100),
      language_code VARCHAR(20),
      text_input TEXT,
      ssml_output TEXT,
      audio_url TEXT,
      naturalness_score FLOAT,
      quality_score FLOAT,
      status VARCHAR(50) DEFAULT 'pending',
      prosody_settings JSONB,
      tts_meta JSONB,
      deleted_at TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

  interp_medical_glossary_packs: `
    CREATE TABLE IF NOT EXISTS interp_medical_glossary_packs (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      language_pair VARCHAR(50),
      specialty_domain VARCHAR(100),
      terms JSONB,
      icd_snomed_mappings JSONB,
      coverage_score FLOAT,
      quality_score FLOAT,
      version VARCHAR(50),
      status VARCHAR(50) DEFAULT 'active',
      deleted_at TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

  interp_legal_glossary_packs: `
    CREATE TABLE IF NOT EXISTS interp_legal_glossary_packs (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      language_pair VARCHAR(50),
      jurisdiction VARCHAR(100),
      legal_area VARCHAR(100),
      terms JSONB,
      faux_amis JSONB,
      coverage_score FLOAT,
      quality_score FLOAT,
      version VARCHAR(50),
      status VARCHAR(50) DEFAULT 'active',
      deleted_at TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

  interp_dialect_adaptations: `
    CREATE TABLE IF NOT EXISTS interp_dialect_adaptations (
      id SERIAL PRIMARY KEY,
      session_id INTEGER,
      language_code VARCHAR(20),
      detected_dialect VARCHAR(100),
      region_tag VARCHAR(100),
      formality_level VARCHAR(50),
      sociolect VARCHAR(100),
      adaptation_rules JSONB,
      recognition_score FLOAT,
      code_switching_detected BOOLEAN DEFAULT FALSE,
      bilingual_handling VARCHAR(100),
      dialect_meta JSONB,
      deleted_at TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

  interp_speaker_diarizations: `
    CREATE TABLE IF NOT EXISTS interp_speaker_diarizations (
      id SERIAL PRIMARY KEY,
      session_id INTEGER,
      num_speakers INTEGER,
      speaker_labels JSONB,
      turn_distribution JSONB,
      accuracy_score FLOAT,
      mic_config VARCHAR(100),
      channel_split BOOLEAN DEFAULT FALSE,
      crosstalk_detected BOOLEAN DEFAULT FALSE,
      impostor_detected BOOLEAN DEFAULT FALSE,
      min_segment_duration_ms INTEGER,
      diarization_meta JSONB,
      deleted_at TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

  interp_compliance_logs: `
    CREATE TABLE IF NOT EXISTS interp_compliance_logs (
      id SERIAL PRIMARY KEY,
      session_id INTEGER,
      event_type VARCHAR(100),
      user_id INTEGER,
      phrase_text TEXT,
      phi_pii_detected BOOLEAN DEFAULT FALSE,
      redacted_text TEXT,
      hipaa_violation BOOLEAN DEFAULT FALSE,
      disclosure_type VARCHAR(100),
      retention_policy VARCHAR(100),
      encryption_verified BOOLEAN DEFAULT FALSE,
      tamper_detected BOOLEAN DEFAULT FALSE,
      compliance_score FLOAT,
      breach_risk VARCHAR(50),
      audit_meta JSONB,
      deleted_at TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`
};

const TABLE_KEYS = Object.keys(TABLES);
const tableInitMap = {};

async function ensureInterpTables(db, tableNames) {
  if (!db || typeof db.query !== 'function') return;
  const names = tableNames || TABLE_KEYS;
  for (const name of names) {
    if (tableInitMap[name]) continue;
    try {
      await db.query(TABLES[name]);
      tableInitMap[name] = true;
    } catch (e) {
      // best-effort; don't crash route
    }
  }
}

module.exports = { ensureInterpTables, TABLES };
