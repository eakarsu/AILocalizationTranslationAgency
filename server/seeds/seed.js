require('dotenv').config({ path: '../../.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log('Seeding database...');

  // Create tables
  await pool.query(`
    DROP TABLE IF EXISTS translation_files, invoices, orders, glossary, language_pairs, translators, projects, clients, users CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE clients (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      company VARCHAR(255),
      phone VARCHAR(50),
      country VARCHAR(100),
      industry VARCHAR(100),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE translators (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      languages TEXT,
      specializations TEXT,
      rate_per_word DECIMAL(10,4) DEFAULT 0.10,
      rating DECIMAL(3,2) DEFAULT 4.50,
      status VARCHAR(50) DEFAULT 'available',
      country VARCHAR(100),
      experience_years INTEGER DEFAULT 0,
      certifications TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      source_language VARCHAR(50),
      target_languages TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      deadline DATE,
      budget DECIMAL(12,2),
      word_count INTEGER DEFAULT 0,
      project_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE language_pairs (
      id SERIAL PRIMARY KEY,
      source_language VARCHAR(100) NOT NULL,
      target_language VARCHAR(100) NOT NULL,
      rate_per_word DECIMAL(10,4) DEFAULT 0.10,
      avg_delivery_days INTEGER DEFAULT 5,
      available_translators INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      quality_tier VARCHAR(50) DEFAULT 'standard',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE glossary (
      id SERIAL PRIMARY KEY,
      term VARCHAR(255) NOT NULL,
      definition TEXT,
      source_language VARCHAR(100),
      target_language VARCHAR(100),
      translation VARCHAR(255),
      domain VARCHAR(100),
      context TEXT,
      approved BOOLEAN DEFAULT false,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      translator_id INTEGER REFERENCES translators(id) ON DELETE SET NULL,
      source_language VARCHAR(100),
      target_language VARCHAR(100),
      word_count INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      priority VARCHAR(50) DEFAULT 'normal',
      deadline DATE,
      total_cost DECIMAL(12,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(50) UNIQUE,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      amount DECIMAL(12,2) DEFAULT 0,
      tax DECIMAL(12,2) DEFAULT 0,
      total DECIMAL(12,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'draft',
      due_date DATE,
      paid_date DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE translation_files (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      file_type VARCHAR(50),
      source_language VARCHAR(100),
      target_language VARCHAR(100),
      word_count INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      file_path TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Seed users
  const hash = await bcrypt.hash('password123', 10);
  await pool.query(`
    INSERT INTO users (name, email, password_hash, role) VALUES
    ('Admin User', 'admin@agency.com', $1, 'admin'),
    ('Project Manager', 'pm@agency.com', $1, 'manager'),
    ('Translator User', 'translator@agency.com', $1, 'translator')
  `, [hash]);

  // Seed clients (15)
  await pool.query(`
    INSERT INTO clients (name, email, company, phone, country, industry, notes, status) VALUES
    ('Sarah Johnson', 'sarah@techcorp.com', 'TechCorp Inc.', '+1-555-0101', 'United States', 'Technology', 'Enterprise client, priority support', 'active'),
    ('Hiroshi Tanaka', 'hiroshi@sakura.jp', 'Sakura Electronics', '+81-3-5555-0102', 'Japan', 'Electronics', 'Needs Japanese-English translations', 'active'),
    ('Marie Dubois', 'marie@luxemode.fr', 'LuxeMode Paris', '+33-1-5555-0103', 'France', 'Fashion', 'Luxury brand, precise tone required', 'active'),
    ('Carlos Mendez', 'carlos@globalmed.mx', 'GlobalMed Solutions', '+52-55-5555-0104', 'Mexico', 'Healthcare', 'Medical terminology specialist needed', 'active'),
    ('Anna Schmidt', 'anna@autowerk.de', 'AutoWerk GmbH', '+49-30-5555-0105', 'Germany', 'Automotive', 'Technical manuals, strict quality', 'active'),
    ('Li Wei', 'liwei@dragontech.cn', 'DragonTech Ltd.', '+86-10-5555-0106', 'China', 'Technology', 'Software localization focus', 'active'),
    ('Priya Sharma', 'priya@bollywood.in', 'Bollywood Studios', '+91-22-5555-0107', 'India', 'Entertainment', 'Movie subtitles and dubbing scripts', 'active'),
    ('Ahmed Al-Rashid', 'ahmed@oilco.sa', 'Gulf Oil Corp', '+966-11-555-0108', 'Saudi Arabia', 'Energy', 'RTL language support needed', 'active'),
    ('Sofia Rossi', 'sofia@bellavita.it', 'Bella Vita Foods', '+39-06-5555-0109', 'Italy', 'Food & Beverage', 'Marketing content localization', 'active'),
    ('James O''Brien', 'james@finserv.ie', 'FinServ Dublin', '+353-1-555-0110', 'Ireland', 'Finance', 'Regulatory document translation', 'active'),
    ('Yuki Mori', 'yuki@gamestudio.jp', 'Game Studio Tokyo', '+81-3-5555-0111', 'Japan', 'Gaming', 'Game UI/UX localization', 'active'),
    ('Elena Petrova', 'elena@cosmo.ru', 'CosmoBeauty', '+7-495-555-0112', 'Russia', 'Cosmetics', 'Product descriptions, packaging', 'active'),
    ('Hans Mueller', 'hans@pharma.de', 'PharmaPlus AG', '+49-89-5555-0113', 'Germany', 'Pharmaceutical', 'Clinical trial documents', 'active'),
    ('Park Min-jun', 'minjun@kpop.kr', 'K-Wave Media', '+82-2-5555-0114', 'South Korea', 'Entertainment', 'K-pop lyrics and fan content', 'active'),
    ('Isabella Santos', 'isabella@ecom.br', 'E-Commerce Brasil', '+55-11-5555-0115', 'Brazil', 'E-Commerce', 'Product catalog localization', 'active'),
    ('Tom Wilson', 'tom@legalfirm.uk', 'Wilson & Partners', '+44-20-5555-0116', 'United Kingdom', 'Legal', 'Legal contract translations', 'inactive')
  `);

  // Seed translators (15)
  await pool.query(`
    INSERT INTO translators (name, email, languages, specializations, rate_per_word, rating, status, country, experience_years, certifications) VALUES
    ('Maria Garcia', 'maria.g@trans.com', 'English, Spanish, Portuguese', 'Legal, Medical', 0.12, 4.90, 'available', 'Spain', 12, 'ATA Certified, NAATI'),
    ('Kenji Yamamoto', 'kenji@trans.jp', 'Japanese, English, Korean', 'Technology, Gaming', 0.15, 4.85, 'available', 'Japan', 8, 'JLPT N1, JTA Certified'),
    ('Francoise Martin', 'francoise@trans.fr', 'French, English, German', 'Fashion, Marketing', 0.13, 4.75, 'busy', 'France', 10, 'DELF C2, SFT Member'),
    ('Zhang Wei', 'zhang@trans.cn', 'Chinese, English, Japanese', 'Technology, Finance', 0.11, 4.80, 'available', 'China', 7, 'CATTI Level 2'),
    ('Fatima Hassan', 'fatima@trans.eg', 'Arabic, English, French', 'Legal, Business', 0.14, 4.95, 'available', 'Egypt', 15, 'AIIC Member'),
    ('Klaus Weber', 'klaus@trans.de', 'German, English, Dutch', 'Automotive, Engineering', 0.16, 4.70, 'available', 'Germany', 11, 'BDÜ Certified'),
    ('Olga Ivanova', 'olga@trans.ru', 'Russian, English, Ukrainian', 'Literature, Arts', 0.10, 4.60, 'available', 'Russia', 6, 'UTR Member'),
    ('Raj Patel', 'raj@trans.in', 'Hindi, English, Gujarati', 'IT, E-Commerce', 0.08, 4.65, 'busy', 'India', 5, 'IGNOU Certified'),
    ('Ana Costa', 'ana@trans.br', 'Portuguese, English, Spanish', 'Marketing, Tourism', 0.09, 4.70, 'available', 'Brazil', 9, 'SINTRA Member'),
    ('Kim Soo-yeon', 'sooyeon@trans.kr', 'Korean, English, Japanese', 'Entertainment, Media', 0.13, 4.85, 'available', 'South Korea', 7, 'KLAT Certified'),
    ('Marco Bianchi', 'marco@trans.it', 'Italian, English, French', 'Food, Tourism, Art', 0.11, 4.55, 'available', 'Italy', 8, 'AITI Member'),
    ('Aisha Mohammed', 'aisha@trans.ae', 'Arabic, English, Urdu', 'Oil & Gas, Finance', 0.15, 4.90, 'available', 'UAE', 13, 'ATA Certified'),
    ('Sven Eriksson', 'sven@trans.se', 'Swedish, English, Norwegian, Danish', 'Technology, Gaming', 0.14, 4.75, 'available', 'Sweden', 10, 'Kammarkollegiet Auth.'),
    ('Ewa Kowalska', 'ewa@trans.pl', 'Polish, English, German', 'Medical, Pharmaceutical', 0.10, 4.80, 'busy', 'Poland', 9, 'STP Member'),
    ('Youssef Ben Ali', 'youssef@trans.tn', 'Arabic, French, English', 'Legal, Government', 0.11, 4.65, 'available', 'Tunisia', 6, 'ATIJT Member'),
    ('Hana Novak', 'hana@trans.cz', 'Czech, English, Slovak, German', 'IT, Automotive', 0.09, 4.70, 'available', 'Czech Republic', 7, 'JTP Member')
  `);

  // Seed projects (15)
  await pool.query(`
    INSERT INTO projects (name, description, client_id, source_language, target_languages, status, deadline, budget, word_count, project_type) VALUES
    ('TechCorp Website Localization', 'Full website translation for APAC markets', 1, 'English', 'Japanese, Chinese, Korean', 'in_progress', '2026-05-15', 45000.00, 125000, 'Website'),
    ('Sakura Product Manuals', 'Electronics user manuals EN translation', 2, 'Japanese', 'English, German, French', 'in_progress', '2026-04-30', 28000.00, 85000, 'Technical'),
    ('LuxeMode Spring Campaign', 'Spring collection marketing materials', 3, 'French', 'English, Italian, Japanese, Chinese', 'pending', '2026-05-01', 15000.00, 32000, 'Marketing'),
    ('GlobalMed Clinical Trials', 'Phase 3 clinical trial documentation', 4, 'Spanish', 'English, Portuguese', 'in_progress', '2026-06-30', 62000.00, 180000, 'Medical'),
    ('AutoWerk Service Manual v4.2', 'Updated service manual for new models', 5, 'German', 'English, French, Spanish, Italian', 'review', '2026-04-20', 35000.00, 95000, 'Technical'),
    ('DragonTech App Localization', 'Mobile app UI strings and docs', 6, 'Chinese', 'English, Japanese, Korean, Spanish', 'in_progress', '2026-05-10', 18000.00, 42000, 'Software'),
    ('Bollywood Subtitle Pack', 'Subtitles for 5 upcoming releases', 7, 'Hindi', 'English, Arabic, French, Spanish', 'pending', '2026-07-01', 22000.00, 55000, 'Entertainment'),
    ('Gulf Oil Annual Report', 'Annual report for international shareholders', 8, 'Arabic', 'English, French, Chinese', 'completed', '2026-03-15', 19000.00, 48000, 'Corporate'),
    ('Bella Vita Recipe Book', 'Authentic Italian cookbook translation', 9, 'Italian', 'English, German, Japanese', 'in_progress', '2026-05-20', 12000.00, 28000, 'Publishing'),
    ('FinServ Compliance Docs', 'EU regulatory compliance documents', 10, 'English', 'German, French, Italian, Spanish', 'urgent', '2026-04-25', 55000.00, 150000, 'Legal'),
    ('Game Studio RPG Localization', 'JRPG full game localization', 11, 'Japanese', 'English, Chinese, Korean, German', 'in_progress', '2026-08-01', 85000.00, 320000, 'Gaming'),
    ('CosmoBeauty Product Line', 'Product descriptions for global launch', 12, 'Russian', 'English, French, Arabic, Chinese', 'pending', '2026-06-15', 16000.00, 38000, 'Marketing'),
    ('PharmaPlus Drug Labels', 'Pharmaceutical labeling compliance', 13, 'German', 'English, French, Spanish, Japanese', 'in_progress', '2026-05-30', 42000.00, 65000, 'Pharmaceutical'),
    ('K-Wave Fan Platform', 'Fan community platform localization', 14, 'Korean', 'English, Japanese, Chinese, Spanish', 'in_progress', '2026-06-01', 24000.00, 72000, 'Entertainment'),
    ('E-Commerce Brasil Catalog', 'Product catalog for LatAm expansion', 15, 'Portuguese', 'Spanish, English, French', 'pending', '2026-07-15', 31000.00, 96000, 'E-Commerce'),
    ('Wilson Legal Contracts', 'International contract templates', 16, 'English', 'German, French, Spanish, Chinese', 'review', '2026-04-18', 38000.00, 88000, 'Legal')
  `);

  // Seed language pairs (15)
  await pool.query(`
    INSERT INTO language_pairs (source_language, target_language, rate_per_word, avg_delivery_days, available_translators, status, quality_tier) VALUES
    ('English', 'Spanish', 0.10, 3, 45, 'active', 'premium'),
    ('English', 'French', 0.12, 3, 38, 'active', 'premium'),
    ('English', 'German', 0.14, 4, 32, 'active', 'premium'),
    ('English', 'Japanese', 0.18, 5, 18, 'active', 'premium'),
    ('English', 'Chinese (Simplified)', 0.15, 4, 25, 'active', 'premium'),
    ('English', 'Korean', 0.16, 5, 15, 'active', 'standard'),
    ('English', 'Arabic', 0.14, 5, 20, 'active', 'standard'),
    ('English', 'Portuguese', 0.09, 3, 28, 'active', 'standard'),
    ('Japanese', 'English', 0.20, 5, 12, 'active', 'premium'),
    ('German', 'English', 0.13, 3, 22, 'active', 'premium'),
    ('French', 'English', 0.11, 3, 30, 'active', 'premium'),
    ('Chinese (Simplified)', 'English', 0.17, 5, 20, 'active', 'standard'),
    ('Spanish', 'Portuguese', 0.08, 2, 35, 'active', 'standard'),
    ('Korean', 'Japanese', 0.19, 6, 8, 'active', 'premium'),
    ('Arabic', 'French', 0.15, 5, 12, 'active', 'standard'),
    ('Russian', 'English', 0.12, 4, 18, 'active', 'standard')
  `);

  // Seed glossary (15)
  await pool.query(`
    INSERT INTO glossary (term, definition, source_language, target_language, translation, domain, context, approved, notes) VALUES
    ('Machine Learning', 'A subset of AI that enables systems to learn from data', 'English', 'Spanish', 'Aprendizaje automático', 'Technology', 'Used in AI/ML documentation', true, 'Do not translate as "aprendizaje de máquina"'),
    ('Cloud Computing', 'Delivery of computing services over the internet', 'English', 'Japanese', 'クラウドコンピューティング', 'Technology', 'IT infrastructure docs', true, 'Katakana transliteration preferred'),
    ('Due Diligence', 'Investigation of a business before signing a contract', 'English', 'German', 'Sorgfaltspflicht', 'Legal', 'M&A documentation', true, 'Legal term, keep formal'),
    ('Intellectual Property', 'Creations of the mind protected by law', 'English', 'French', 'Propriété intellectuelle', 'Legal', 'Patent and copyright docs', true, 'Abbreviated as PI in French'),
    ('Supply Chain', 'Network of organizations involved in production', 'English', 'Chinese', '供应链', 'Business', 'Manufacturing and logistics', true, 'Standard business term'),
    ('Sustainability', 'Meeting present needs without compromising future', 'English', 'Spanish', 'Sostenibilidad', 'Environment', 'CSR reports and green initiatives', true, 'Also "sustentabilidad" in LatAm'),
    ('User Interface', 'The space where interaction between humans and machines occurs', 'English', 'Korean', '사용자 인터페이스', 'Technology', 'Software documentation', true, 'UI is acceptable abbreviation'),
    ('Blockchain', 'Distributed ledger technology', 'English', 'Arabic', 'بلوك تشين', 'Finance', 'Cryptocurrency and fintech', false, 'Transliteration vs translation debate'),
    ('Organic', 'Produced without synthetic chemicals', 'English', 'Italian', 'Biologico', 'Food', 'Food labeling and marketing', true, 'Not "organico" - use "biologico"'),
    ('Bandwidth', 'Maximum rate of data transfer', 'English', 'Portuguese', 'Largura de banda', 'Technology', 'Networking documentation', true, 'Technical networking term'),
    ('Compliance', 'Adherence to laws and regulations', 'English', 'German', 'Compliance / Konformität', 'Legal', 'Regulatory documents', true, 'English loanword often used in German'),
    ('ROI', 'Return on Investment', 'English', 'French', 'Retour sur investissement', 'Finance', 'Business reports and proposals', true, 'RSI is the French abbreviation'),
    ('Responsive Design', 'Web design that adapts to screen size', 'English', 'Japanese', 'レスポンシブデザイン', 'Technology', 'Web development docs', true, 'Katakana transliteration'),
    ('Stakeholder', 'Person with interest in a project or company', 'English', 'Spanish', 'Parte interesada', 'Business', 'Project management docs', true, 'Also "interesado" in some contexts'),
    ('API', 'Application Programming Interface', 'English', 'Chinese', '应用程序编程接口', 'Technology', 'Developer documentation', true, 'API abbreviation widely used'),
    ('GDPR', 'General Data Protection Regulation', 'English', 'German', 'DSGVO (Datenschutz-Grundverordnung)', 'Legal', 'Privacy and data protection', true, 'Always use German abbreviation DSGVO')
  `);

  // Seed orders (15)
  await pool.query(`
    INSERT INTO orders (project_id, client_id, translator_id, source_language, target_language, word_count, status, priority, deadline, total_cost, notes) VALUES
    (1, 1, 2, 'English', 'Japanese', 42000, 'in_progress', 'high', '2026-05-01', 7560.00, 'Priority: homepage and product pages first'),
    (1, 1, 4, 'English', 'Chinese', 42000, 'in_progress', 'high', '2026-05-05', 6300.00, 'Simplified Chinese, mainland market'),
    (1, 1, 10, 'English', 'Korean', 41000, 'pending', 'normal', '2026-05-10', 5330.00, 'South Korean market focus'),
    (2, 2, 1, 'Japanese', 'English', 28000, 'in_progress', 'normal', '2026-04-20', 5600.00, 'Technical accuracy critical'),
    (3, 3, 1, 'French', 'English', 8000, 'pending', 'high', '2026-04-28', 960.00, 'Luxury brand voice must be preserved'),
    (3, 3, 11, 'French', 'Italian', 8000, 'pending', 'normal', '2026-04-30', 880.00, 'Milan fashion week timing'),
    (4, 4, 1, 'Spanish', 'English', 90000, 'in_progress', 'urgent', '2026-06-15', 10800.00, 'FDA submission deadline'),
    (5, 5, 6, 'German', 'English', 24000, 'review', 'normal', '2026-04-15', 3840.00, 'Technical review by SME required'),
    (6, 6, 2, 'Chinese', 'Japanese', 10000, 'in_progress', 'high', '2026-05-01', 1900.00, 'App store listing priority'),
    (7, 7, 5, 'Hindi', 'Arabic', 11000, 'pending', 'normal', '2026-06-15', 1540.00, 'MENA market subtitles'),
    (9, 9, 11, 'Italian', 'English', 9000, 'in_progress', 'low', '2026-05-10', 990.00, 'Culinary terminology important'),
    (10, 10, 6, 'English', 'German', 38000, 'urgent', 'urgent', '2026-04-20', 6080.00, 'EU regulation deadline'),
    (11, 11, 2, 'Japanese', 'English', 80000, 'in_progress', 'high', '2026-07-15', 16000.00, 'Game dialogue and UI strings'),
    (13, 13, 14, 'German', 'French', 16000, 'in_progress', 'high', '2026-05-15', 1600.00, 'Pharmaceutical labeling standards'),
    (14, 14, 10, 'Korean', 'English', 24000, 'pending', 'normal', '2026-05-20', 3120.00, 'Fan community content'),
    (15, 15, 9, 'Portuguese', 'Spanish', 32000, 'pending', 'normal', '2026-07-01', 2560.00, 'LatAm Spanish variant')
  `);

  // Seed invoices (15)
  await pool.query(`
    INSERT INTO invoices (invoice_number, client_id, order_id, amount, tax, total, status, due_date, paid_date, notes) VALUES
    ('INV-2026-001', 1, 1, 7560.00, 604.80, 8164.80, 'sent', '2026-05-15', NULL, 'TechCorp JP translation'),
    ('INV-2026-002', 1, 2, 6300.00, 504.00, 6804.00, 'sent', '2026-05-20', NULL, 'TechCorp CN translation'),
    ('INV-2026-003', 2, 4, 5600.00, 448.00, 6048.00, 'paid', '2026-04-30', '2026-04-15', 'Sakura manuals - paid early'),
    ('INV-2026-004', 3, 5, 960.00, 76.80, 1036.80, 'draft', '2026-05-15', NULL, 'LuxeMode EN translation'),
    ('INV-2026-005', 3, 6, 880.00, 70.40, 950.40, 'draft', '2026-05-15', NULL, 'LuxeMode IT translation'),
    ('INV-2026-006', 4, 7, 10800.00, 864.00, 11664.00, 'sent', '2026-07-01', NULL, 'GlobalMed clinical trials'),
    ('INV-2026-007', 5, 8, 3840.00, 307.20, 4147.20, 'paid', '2026-04-30', '2026-04-10', 'AutoWerk manual review'),
    ('INV-2026-008', 6, 9, 1900.00, 152.00, 2052.00, 'sent', '2026-05-15', NULL, 'DragonTech app JP'),
    ('INV-2026-009', 7, 10, 1540.00, 123.20, 1663.20, 'draft', '2026-07-01', NULL, 'Bollywood subtitles AR'),
    ('INV-2026-010', 9, 11, 990.00, 79.20, 1069.20, 'sent', '2026-05-30', NULL, 'Bella Vita cookbook EN'),
    ('INV-2026-011', 10, 12, 6080.00, 486.40, 6566.40, 'overdue', '2026-04-05', NULL, 'FinServ compliance - OVERDUE'),
    ('INV-2026-012', 11, 13, 16000.00, 1280.00, 17280.00, 'sent', '2026-08-01', NULL, 'Game Studio RPG EN'),
    ('INV-2026-013', 13, 14, 1600.00, 128.00, 1728.00, 'sent', '2026-06-01', NULL, 'PharmaPlus labels FR'),
    ('INV-2026-014', 14, 15, 3120.00, 249.60, 3369.60, 'draft', '2026-06-15', NULL, 'K-Wave platform EN'),
    ('INV-2026-015', 15, 16, 2560.00, 204.80, 2764.80, 'draft', '2026-07-30', NULL, 'E-Commerce Brasil ES'),
    ('INV-2026-016', 1, 3, 5330.00, 426.40, 5756.40, 'sent', '2026-05-25', NULL, 'TechCorp KR translation')
  `);

  // Seed translation files (15)
  await pool.query(`
    INSERT INTO translation_files (name, project_id, file_type, source_language, target_language, word_count, status, file_path, notes) VALUES
    ('homepage_en.html', 1, 'HTML', 'English', 'Japanese', 3200, 'translated', '/files/techcorp/homepage_en.html', 'Main landing page'),
    ('product_catalog.json', 1, 'JSON', 'English', 'Chinese', 15000, 'in_progress', '/files/techcorp/product_catalog.json', 'Product listing strings'),
    ('user_manual_v4.docx', 2, 'DOCX', 'Japanese', 'English', 28000, 'in_progress', '/files/sakura/user_manual_v4.docx', 'Complete user manual'),
    ('spring_campaign.pdf', 3, 'PDF', 'French', 'English', 5000, 'pending', '/files/luxemode/spring_campaign.pdf', 'Marketing brochure'),
    ('clinical_protocol.docx', 4, 'DOCX', 'Spanish', 'English', 45000, 'in_progress', '/files/globalmed/clinical_protocol.docx', 'Phase 3 protocol'),
    ('service_manual_4.2.xml', 5, 'XML', 'German', 'English', 24000, 'review', '/files/autowerk/service_manual_4.2.xml', 'Structured XML format'),
    ('app_strings.xliff', 6, 'XLIFF', 'Chinese', 'Japanese', 8000, 'in_progress', '/files/dragontech/app_strings.xliff', 'Mobile app UI strings'),
    ('movie_subtitles_01.srt', 7, 'SRT', 'Hindi', 'English', 12000, 'pending', '/files/bollywood/movie_subtitles_01.srt', 'Feature film subtitles'),
    ('annual_report_2025.pdf', 8, 'PDF', 'Arabic', 'English', 48000, 'completed', '/files/gulfoil/annual_report_2025.pdf', 'RTL to LTR conversion'),
    ('recipes_collection.docx', 9, 'DOCX', 'Italian', 'English', 9000, 'in_progress', '/files/bellavita/recipes_collection.docx', 'Cookbook content'),
    ('compliance_framework.docx', 10, 'DOCX', 'English', 'German', 38000, 'urgent', '/files/finserv/compliance_framework.docx', 'EU regulatory framework'),
    ('game_dialogue.csv', 11, 'CSV', 'Japanese', 'English', 120000, 'in_progress', '/files/gamestudio/game_dialogue.csv', 'RPG dialogue tree'),
    ('product_labels.xliff', 13, 'XLIFF', 'German', 'French', 8500, 'in_progress', '/files/pharmaplus/product_labels.xliff', 'Drug labeling'),
    ('fan_platform_ui.json', 14, 'JSON', 'Korean', 'English', 15000, 'pending', '/files/kwave/fan_platform_ui.json', 'Platform UI strings'),
    ('product_catalog_br.csv', 15, 'CSV', 'Portuguese', 'Spanish', 32000, 'pending', '/files/ecommerce/product_catalog_br.csv', 'LatAm product catalog'),
    ('legal_templates.docx', 16, 'DOCX', 'English', 'French', 22000, 'review', '/files/wilson/legal_templates.docx', 'Contract templates')
  `);

  console.log('Database seeded successfully!');
  await pool.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
