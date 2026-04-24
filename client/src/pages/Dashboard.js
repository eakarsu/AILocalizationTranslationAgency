import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const managementCards = [
  { path: '/projects', icon: '\u{1F4C1}', title: 'Projects', desc: 'Manage translation projects, track progress and deadlines', color: '#6366f1' },
  { path: '/clients', icon: '\u{1F465}', title: 'Clients', desc: 'Client relationship management and communication', color: '#8b5cf6' },
  { path: '/translators', icon: '\u{1F310}', title: 'Translators', desc: 'Translator pool management, ratings and availability', color: '#0ea5e9' },
  { path: '/languages', icon: '\u{1F5E3}', title: 'Language Pairs', desc: 'Supported language combinations and pricing', color: '#14b8a6' },
  { path: '/glossary', icon: '\u{1F4D6}', title: 'Glossary', desc: 'Terminology database for consistent translations', color: '#f59e0b' },
  { path: '/orders', icon: '\u{1F4E6}', title: 'Orders', desc: 'Track and manage translation orders and assignments', color: '#ef4444' },
  { path: '/invoices', icon: '\u{1F4B3}', title: 'Invoices', desc: 'Billing, invoicing and payment tracking', color: '#22c55e' },
  { path: '/files', icon: '\u{1F4C4}', title: 'Files', desc: 'Translation file management and version control', color: '#64748b' },
];

const aiCards = [
  { path: '/ai/translate', icon: '\u{1F30D}', title: 'AI Translation', desc: 'Intelligent multi-language translation with context awareness', color: '#818cf8' },
  { path: '/ai/localize', icon: '\u{1F3AF}', title: 'AI Localization', desc: 'Adapt content for specific markets and cultures', color: '#a78bfa' },
  { path: '/ai/grammar', icon: '\u2713', title: 'Grammar & Style', desc: 'AI-powered grammar checking and style improvement', color: '#38bdf8' },
  { path: '/ai/terminology', icon: '\u{1F4DA}', title: 'AI Terminology', desc: 'Smart terminology extraction and suggestion', color: '#2dd4bf' },
  { path: '/ai/tm', icon: '\u{1F9E0}', title: 'Translation Memory', desc: 'AI-enhanced translation memory matching', color: '#fb923c' },
  { path: '/ai/quality', icon: '\u2B50', title: 'Quality Assessment', desc: 'MQM-based translation quality scoring', color: '#fbbf24' },
  { path: '/ai/cultural', icon: '\u{1F30F}', title: 'Cultural Adaptation', desc: 'Cultural sensitivity analysis and content adaptation', color: '#f472b6' },
  { path: '/ai/seo', icon: '\u{1F50D}', title: 'SEO Localization', desc: 'International SEO optimization for target markets', color: '#34d399' },
  { path: '/ai/back-translation', icon: '\u{1F504}', title: 'Back-Translation', desc: 'Verify translation accuracy via back-translation', color: '#c084fc' },
  { path: '/ai/sentiment', icon: '\u{1F4AC}', title: 'Sentiment Analysis', desc: 'Analyze emotional tone preservation across languages', color: '#fb7185' },
  { path: '/ai/lang-detect', icon: '\u{1F50E}', title: 'Language Detection', desc: 'Auto-detect language, dialect, and script', color: '#22d3ee' },
  { path: '/ai/readability', icon: '\u{1F4CA}', title: 'Readability Analysis', desc: 'Evaluate text complexity and reading level', color: '#a3e635' },
  { path: '/ai/style-transfer', icon: '\u{1F3A8}', title: 'Style Transfer', desc: 'Transform text style while preserving meaning', color: '#e879f9' },
  { path: '/ai/summarize', icon: '\u{1F4DD}', title: 'Summarization', desc: 'Generate multilingual summaries for briefing', color: '#67e8f9' },
  { path: '/ai/brand-voice', icon: '\u{1F3F7}', title: 'Brand Voice Check', desc: 'Enforce brand voice consistency across content', color: '#fdba74' },
  { path: '/ai/subtitles', icon: '\u{1F3AC}', title: 'Subtitles & Captions', desc: 'Generate and translate subtitles with timing', color: '#86efac' },
  { path: '/ai/doc-compare', icon: '\u{1F4D1}', title: 'Document Compare', desc: 'Find gaps and inconsistencies in translations', color: '#93c5fd' },
  { path: '/ai/competitor', icon: '\u{1F3C6}', title: 'Competitor Analysis', desc: 'Analyze competitor localization strategies', color: '#fca5a5' },
  { path: '/ai/project-analyzer', icon: '\u{1F4CB}', title: 'Project Analyzer', desc: 'AI project scoping, costing, and risk analysis', color: '#d8b4fe' },
  { path: '/ai/client-insights', icon: '\u{1F4A1}', title: 'Client Insights', desc: 'Predict client needs and upsell opportunities', color: '#fde047' },
  { path: '/ai/translator-matcher', icon: '\u{1F91D}', title: 'Translator Matcher', desc: 'AI-powered translator-project matching', color: '#6ee7b7' },
  { path: '/ai/glossary-gen', icon: '\u{1F4D5}', title: 'Glossary Generator', desc: 'Auto-generate bilingual glossaries from content', color: '#c4b5fd' },
  { path: '/ai/order-optimizer', icon: '\u{1F4C8}', title: 'Order Optimizer', desc: 'Optimize order batching and scheduling', color: '#fda4af' },
  { path: '/ai/invoice-analyzer', icon: '\u{1F4B0}', title: 'Invoice Analyzer', desc: 'Revenue forecasting and pricing optimization', color: '#a7f3d0' },
  { path: '/ai/bias-check', icon: '\u{1F6E1}', title: 'Bias & Inclusivity', desc: 'Detect bias and non-inclusive language', color: '#ddd6fe' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, clients: 0, translators: 0, orders: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/projects').catch(() => ({ data: [] })),
      api.get('/clients').catch(() => ({ data: [] })),
      api.get('/translators').catch(() => ({ data: [] })),
      api.get('/orders').catch(() => ({ data: [] })),
    ]).then(([p, c, t, o]) => {
      setStats({
        projects: p.data.length,
        clients: c.data.length,
        translators: t.data.length,
        orders: o.data.length,
      });
    });
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to the AI Localization & Translation Agency</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">{stats.projects}</div>
          <div className="stat-sub">translation projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clients</div>
          <div className="stat-value">{stats.clients}</div>
          <div className="stat-sub">global clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Translators</div>
          <div className="stat-value">{stats.translators}</div>
          <div className="stat-sub">professional translators</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders</div>
          <div className="stat-value">{stats.orders}</div>
          <div className="stat-sub">active orders</div>
        </div>
      </div>

      <div className="cards-section">
        <h2>Management</h2>
        <div className="cards-grid">
          {managementCards.map(card => (
            <div key={card.path} className="feature-card" style={{'--card-color': card.color}} onClick={() => navigate(card.path)}>
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <span className="card-badge badge-mgmt">Management</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cards-section">
        <h2>AI-Powered Tools</h2>
        <div className="cards-grid">
          {aiCards.map(card => (
            <div key={card.path} className="feature-card" style={{'--card-color': card.color}} onClick={() => navigate(card.path)}>
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <span className="card-badge badge-ai">AI Powered</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
