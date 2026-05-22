import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { section: 'Management', items: [
    { path: '/', icon: '\u2302', label: 'Dashboard' },
    { path: '/projects', icon: '\u{1F4C1}', label: 'Projects' },
    { path: '/clients', icon: '\u{1F465}', label: 'Clients' },
    { path: '/translators', icon: '\u{1F310}', label: 'Translators' },
    { path: '/languages', icon: '\u{1F5E3}', label: 'Language Pairs' },
    { path: '/glossary', icon: '\u{1F4D6}', label: 'Glossary' },
    { path: '/orders', icon: '\u{1F4E6}', label: 'Orders' },
    { path: '/invoices', icon: '\u{1F4B3}', label: 'Invoices' },
    { path: '/files', icon: '\u{1F4C4}', label: 'Files' },
  ]},
  { section: 'AI Translation', collapsible: true, items: [
    { path: '/ai/translate', icon: '\u{1F30D}', label: 'AI Translation' },
    { path: '/ai/localize', icon: '\u{1F3AF}', label: 'AI Localization' },
    { path: '/ai/back-translation', icon: '\u{1F504}', label: 'Back-Translation' },
    { path: '/ai/style-transfer', icon: '\u{1F3A8}', label: 'Style Transfer' },
    { path: '/ai/subtitles', icon: '\u{1F3AC}', label: 'Subtitles & Captions' },
    { path: '/ai/summarize', icon: '\u{1F4DD}', label: 'Summarization' },
  ]},
  { section: 'AI Quality', collapsible: true, items: [
    { path: '/ai/grammar', icon: '\u2713', label: 'Grammar & Style' },
    { path: '/ai/quality', icon: '\u2B50', label: 'Quality Assessment' },
    { path: '/ai/readability', icon: '\u{1F4CA}', label: 'Readability Analysis' },
    { path: '/ai/bias-check', icon: '\u{1F6E1}', label: 'Bias & Inclusivity' },
    { path: '/ai/doc-compare', icon: '\u{1F4D1}', label: 'Document Compare' },
  ]},
  { section: 'AI Analysis', collapsible: true, items: [
    { path: '/ai/sentiment', icon: '\u{1F4AC}', label: 'Sentiment Analysis' },
    { path: '/ai/lang-detect', icon: '\u{1F50E}', label: 'Language Detection' },
    { path: '/ai/terminology', icon: '\u{1F4DA}', label: 'AI Terminology' },
    { path: '/ai/glossary-gen', icon: '\u{1F4D5}', label: 'Glossary Generator' },
    { path: '/ai/brand-voice', icon: '\u{1F3F7}', label: 'Brand Voice Check' },
    { path: '/ai/cultural', icon: '\u{1F30F}', label: 'Cultural Adaptation' },
    { path: '/ai/tm', icon: '\u{1F9E0}', label: 'Translation Memory' },
  ]},
  { section: 'AI Business', collapsible: true, items: [
    { path: '/ai/project-analyzer', icon: '\u{1F4CB}', label: 'Project Analyzer' },
    { path: '/ai/client-insights', icon: '\u{1F4A1}', label: 'Client Insights' },
    { path: '/ai/translator-matcher', icon: '\u{1F91D}', label: 'Translator Matcher' },
    { path: '/ai/order-optimizer', icon: '\u{1F4C8}', label: 'Order Optimizer' },
    { path: '/ai/invoice-analyzer', icon: '\u{1F4B0}', label: 'Invoice Analyzer' },
    { path: '/ai/seo', icon: '\u{1F50D}', label: 'SEO Localization' },
    { path: '/ai/competitor', icon: '\u{1F3C6}', label: 'Competitor Analysis' },
    { path: '/ai/generate-quote', icon: '\u{1F4B2}', label: 'Quote Generator' },
  ]},
  { section: 'Interpretation', collapsible: true, items: [
    { path: '/interp/streaming-asr', icon: '\u{1F3A4}', label: 'Streaming ASR' },
    { path: '/interp/streaming-mt', icon: '\u{1F310}', label: 'Streaming MT' },
    { path: '/interp/streaming-tts', icon: '\u{1F50A}', label: 'Streaming TTS' },
    { path: '/interp/medical-glossary-pack', icon: '\u{1FA7A}', label: 'Medical Glossary' },
    { path: '/interp/legal-glossary-pack', icon: '⚖', label: 'Legal Glossary' },
    { path: '/interp/dialect-adaptation', icon: '\u{1F5E3}', label: 'Dialect Adaptation' },
    { path: '/interp/speaker-diarization', icon: '\u{1F465}', label: 'Speaker Diarization' },
    { path: '/interp/compliance-logging', icon: '\u{1F6E1}', label: 'Compliance Logging' },
  ]},
  { section: 'History', items: [
    { path: '/ai-history', icon: '\u{1F4DC}', label: 'AI Call History' },
  ]},
];

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState({});

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isSectionActive = (items) => items.some(item => location.pathname === item.path);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>AI Localization</h2>
          <p>Translation Agency Platform</p>
        </div>
        {menuItems.map(section => {
          const isCollapsed = collapsed[section.section] && !isSectionActive(section.items);
          return (
            <div key={section.section} className="sidebar-section">
              <div
                className={`sidebar-section-title ${section.collapsible ? 'collapsible' : ''}`}
                onClick={() => section.collapsible && toggleSection(section.section)}
              >
                {section.section}
                {section.collapsible && (
                  <span className="collapse-arrow">{isCollapsed ? '\u25B6' : '\u25BC'}</span>
                )}
              </div>
              {!isCollapsed && section.items.map(item => (
                <div
                  key={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          );
        })}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div>
              <div className="name">{user.name}</div>
              <div className="role">{user.role}</div>
            </div>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
