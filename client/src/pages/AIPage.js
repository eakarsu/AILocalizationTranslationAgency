import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import samples from './aiSamples';

// Dropdown sources mapped to API endpoints
const dropdownSources = {
  clientSelect: { endpoint: '/clients', labelField: 'name', valueField: 'name', extraFields: ['company', 'country', 'industry'] },
  projectSelect: { endpoint: '/projects', labelField: 'name', valueField: 'name', extraFields: ['source_language', 'target_languages', 'status'] },
  translatorSelect: { endpoint: '/translators', labelField: 'name', valueField: 'name', extraFields: ['languages', 'specializations', 'rate_per_word'] },
  languageSelect: { endpoint: '/languages', labelFn: (r) => `${r.source_language} → ${r.target_language}`, valueField: 'source_language' },
  sourceLanguageSelect: { endpoint: '/languages', labelFn: (r) => r.source_language, valueField: 'source_language', unique: true },
  targetLanguageSelect: { endpoint: '/languages', labelFn: (r) => r.target_language, valueField: 'target_language', unique: true },
  glossaryDomainSelect: { endpoint: '/glossary', labelFn: (r) => r.domain, valueField: 'domain', unique: true },
  orderSelect: { endpoint: '/orders', labelFn: (r) => `Order #${r.id}: ${r.source_language}→${r.target_language} (${r.word_count} words)`, valueField: 'id' },
  invoiceSelect: { endpoint: '/invoices', labelFn: (r) => `${r.invoice_number} - $${r.total} (${r.status})`, valueField: 'invoice_number' },
};

const configs = {
  translate: {
    title: 'AI Translation',
    desc: 'Translate text between languages with AI-powered accuracy and context awareness',
    endpoint: '/ai/translate',
    fields: [
      { name: 'text', label: 'Text to Translate', type: 'textarea', required: true },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
      { name: 'tone', label: 'Tone', type: 'text', placeholder: 'formal, casual, technical...' },
      { name: 'domain', label: 'Domain', type: 'text', placeholder: 'legal, medical, tech...', dropdownSource: 'glossaryDomainSelect' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Translation</h4>
          <p style={{fontSize: 16, lineHeight: 1.8}}>{r.translation}</p>
        </div>
        {r.confidence && (
          <div className="ai-result-section">
            <h4>Confidence</h4>
            <div className="score-display">
              <div className={`score-circle ${r.confidence >= 0.9 ? 'score-high' : r.confidence >= 0.7 ? 'score-medium' : 'score-low'}`}>
                {Math.round(r.confidence * 100)}%
              </div>
            </div>
          </div>
        )}
        {r.alternatives?.length > 0 && (
          <div className="ai-result-section">
            <h4>Alternative Translations</h4>
            <ul>{r.alternatives.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>
        )}
        {r.notes && (
          <div className="ai-result-section">
            <h4>Notes</h4>
            <p>{r.notes}</p>
          </div>
        )}
      </>
    ),
  },
  localize: {
    title: 'AI Content Localization',
    desc: 'Adapt content for specific markets with cultural nuances and local conventions',
    endpoint: '/ai/localize',
    fields: [
      { name: 'text', label: 'Content to Localize', type: 'textarea', required: true },
      { name: 'sourceLocale', label: 'Source Locale', type: 'text', placeholder: 'en-US' },
      { name: 'targetLocale', label: 'Target Locale', type: 'text', placeholder: 'ja-JP' },
      { name: 'contentType', label: 'Content Type', type: 'text', placeholder: 'marketing, technical, legal...' },
      { name: 'industry', label: 'Industry', type: 'text', placeholder: 'tech, healthcare, fashion...' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Localized Content</h4>
          <p style={{fontSize: 16, lineHeight: 1.8}}>{r.localizedContent}</p>
        </div>
        {r.adaptations?.length > 0 && (
          <div className="ai-result-section">
            <h4>Adaptations Made</h4>
            {r.adaptations.map((a, i) => (
              <div key={i} className="issue-card severity-minor" style={{marginBottom: 8}}>
                <div className="issue-type">Adaptation</div>
                <div className="issue-detail">
                  <strong>Original:</strong> {a.original}<br/>
                  <strong>Adapted:</strong> {a.adapted}<br/>
                  <strong>Reason:</strong> {a.reason}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.culturalNotes && <div className="ai-result-section"><h4>Cultural Notes</h4><p>{r.culturalNotes}</p></div>}
        {r.marketInsights && <div className="ai-result-section"><h4>Market Insights</h4><p>{r.marketInsights}</p></div>}
      </>
    ),
  },
  grammar: {
    title: 'Grammar & Style Check',
    desc: 'AI-powered grammar, spelling, punctuation, and style analysis',
    endpoint: '/ai/grammar',
    fields: [
      { name: 'text', label: 'Text to Check', type: 'textarea', required: true },
      { name: 'language', label: 'Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'styleGuide', label: 'Style Guide', type: 'text', placeholder: 'AP, Chicago, APA...' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Corrected Text</h4>
          <p style={{fontSize: 16, lineHeight: 1.8}}>{r.correctedText}</p>
        </div>
        <div className="ai-result-section">
          <h4>Overall Score</h4>
          <div className="score-display">
            <div className={`score-circle ${r.overallScore >= 80 ? 'score-high' : r.overallScore >= 60 ? 'score-medium' : 'score-low'}`}>
              {r.overallScore}
            </div>
            <div>
              <div style={{fontWeight: 600}}>{r.overallScore >= 80 ? 'Excellent' : r.overallScore >= 60 ? 'Good' : 'Needs Work'}</div>
              <div style={{fontSize: 12, color: '#94a3b8'}}>Readability: {r.readabilityLevel}</div>
            </div>
          </div>
        </div>
        {r.issues?.length > 0 && (
          <div className="ai-result-section">
            <h4>Issues Found ({r.issues.length})</h4>
            {r.issues.map((issue, i) => (
              <div key={i} className={`issue-card severity-${issue.severity || 'minor'}`}>
                <div className="issue-type" style={{color: issue.type === 'grammar' ? '#f87171' : issue.type === 'spelling' ? '#fbbf24' : '#60a5fa'}}>
                  {issue.type}
                </div>
                <div className="issue-detail">
                  <strong>"{issue.original}"</strong> &rarr; <strong style={{color: '#4ade80'}}>"{issue.suggestion}"</strong><br/>
                  <span style={{color: '#94a3b8', fontSize: 12}}>{issue.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {r.suggestions?.length > 0 && (
          <div className="ai-result-section">
            <h4>Suggestions</h4>
            <ul>{r.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </>
    ),
  },
  terminology: {
    title: 'AI Terminology Extraction',
    desc: 'Extract and manage terminology from text with AI-powered suggestions',
    endpoint: '/ai/terminology',
    fields: [
      { name: 'text', label: 'Text to Analyze', type: 'textarea', required: true },
      { name: 'domain', label: 'Domain', type: 'text', placeholder: 'medical, legal, tech...', dropdownSource: 'glossaryDomainSelect' },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
    ],
    renderResult: (r) => (
      <>
        {r.terms?.length > 0 && (
          <div className="ai-result-section">
            <h4>Extracted Terms ({r.terms.length})</h4>
            {r.terms.map((t, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#818cf8'}}>
                <div className="issue-type" style={{color: '#818cf8'}}>{t.domain || 'General'}</div>
                <div className="issue-detail">
                  <strong style={{fontSize: 15}}>{t.term}</strong>
                  {t.translation && <> &rarr; <strong style={{color: '#4ade80'}}>{t.translation}</strong></>}<br/>
                  {t.definition && <span>{t.definition}</span>}<br/>
                  {t.context && <span style={{color: '#94a3b8', fontSize: 12}}>Context: {t.context}</span>}
                  {t.alternatives?.length > 0 && (
                    <div style={{marginTop: 4}}>
                      {t.alternatives.map((a, j) => <span key={j} className="keyword-tag">{a}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.domainAnalysis && <div className="ai-result-section"><h4>Domain Analysis</h4><p>{r.domainAnalysis}</p></div>}
        {r.consistencyNotes && <div className="ai-result-section"><h4>Consistency Notes</h4><p>{r.consistencyNotes}</p></div>}
      </>
    ),
  },
  tm: {
    title: 'AI Translation Memory',
    desc: 'Smart translation memory matching powered by AI for maximum reuse',
    endpoint: '/ai/tm',
    fields: [
      { name: 'sourceText', label: 'Source Text', type: 'textarea', required: true },
      { name: 'previousTranslations', label: 'Previous Translations (reference)', type: 'textarea', placeholder: 'Paste previous translations for matching...' },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
    ],
    renderResult: (r) => (
      <>
        {r.reusePercentage !== undefined && (
          <div className="ai-result-section">
            <h4>Reuse Analysis</h4>
            <div className="score-display">
              <div className={`score-circle ${r.reusePercentage >= 60 ? 'score-high' : r.reusePercentage >= 30 ? 'score-medium' : 'score-low'}`}>
                {r.reusePercentage}%
              </div>
              <div>
                <div style={{fontWeight: 600}}>Translation Reuse Rate</div>
                {r.estimatedSavings && <div style={{fontSize: 13, color: '#4ade80'}}>Estimated Savings: {r.estimatedSavings}</div>}
              </div>
            </div>
          </div>
        )}
        {r.segments?.length > 0 && (
          <div className="ai-result-section">
            <h4>Segment Matches</h4>
            {r.segments.map((s, i) => (
              <div key={i} className={`issue-card severity-${s.matchType === 'exact' ? 'low' : s.matchType === 'fuzzy' ? 'medium' : 'high'}`}
                   style={{borderLeftColor: s.matchType === 'exact' ? '#4ade80' : s.matchType === 'fuzzy' ? '#fbbf24' : '#94a3b8'}}>
                <div className="issue-type" style={{color: s.matchType === 'exact' ? '#4ade80' : s.matchType === 'fuzzy' ? '#fbbf24' : '#94a3b8'}}>
                  {s.matchType} match ({s.matchPercentage}%)
                </div>
                <div className="issue-detail">
                  <strong>Source:</strong> {s.source}<br/>
                  <strong style={{color: '#4ade80'}}>Suggested:</strong> {s.suggestedTranslation}
                  {s.reference && <><br/><span style={{color: '#94a3b8', fontSize: 12}}>Ref: {s.reference}</span></>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section">
            <h4>Recommendations</h4>
            <ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
          </div>
        )}
      </>
    ),
  },
  quality: {
    title: 'Translation Quality Assessment',
    desc: 'MQM-based quality evaluation across accuracy, fluency, terminology, and style',
    endpoint: '/ai/quality',
    fields: [
      { name: 'sourceText', label: 'Source Text', type: 'textarea', required: true },
      { name: 'translatedText', label: 'Translated Text', type: 'textarea', required: true },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
      { name: 'qualityFramework', label: 'Framework', type: 'text', placeholder: 'MQM' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Overall Quality Score</h4>
          <div className="score-display">
            <div className={`score-circle ${r.overallScore >= 80 ? 'score-high' : r.overallScore >= 60 ? 'score-medium' : 'score-low'}`}>
              {r.overallScore}
            </div>
            <div>
              <div style={{fontWeight: 600}}>{r.overallScore >= 90 ? 'Excellent' : r.overallScore >= 80 ? 'Good' : r.overallScore >= 60 ? 'Acceptable' : 'Needs Revision'}</div>
              {r.verdict && <div style={{fontSize: 13, color: '#94a3b8'}}>{r.verdict}</div>}
            </div>
          </div>
        </div>
        {r.categories && Object.keys(r.categories).length > 0 && (
          <div className="ai-result-section">
            <h4>Category Scores</h4>
            <div className="category-scores">
              {Object.entries(r.categories).map(([cat, score]) => (
                <div key={cat} className="category-score">
                  <div className="cat-label">{cat}</div>
                  <div className="cat-value">{score}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {r.issues?.length > 0 && (
          <div className="ai-result-section">
            <h4>Issues ({r.issues.length})</h4>
            {r.issues.map((issue, i) => (
              <div key={i} className={`issue-card severity-${issue.severity}`}>
                <div className="issue-type" style={{color: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'major' ? '#f59e0b' : '#60a5fa'}}>
                  {issue.category} - {issue.severity}
                </div>
                <div className="issue-detail">
                  <strong>Source:</strong> {issue.source}<br/>
                  <strong>Target:</strong> {issue.target}<br/>
                  {issue.suggestion && <><strong style={{color: '#4ade80'}}>Suggestion:</strong> {issue.suggestion}<br/></>}
                  <span style={{color: '#94a3b8', fontSize: 12}}>{issue.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section">
            <h4>Recommendations</h4>
            <ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
          </div>
        )}
      </>
    ),
  },
  cultural: {
    title: 'Cultural Adaptation',
    desc: 'Analyze and adapt content for cultural appropriateness in target markets',
    endpoint: '/ai/cultural',
    fields: [
      { name: 'text', label: 'Content to Analyze', type: 'textarea', required: true },
      { name: 'sourceculture', label: 'Source Culture', type: 'text', placeholder: 'US/Western' },
      { name: 'targetCulture', label: 'Target Culture', type: 'text', placeholder: 'Japanese' },
      { name: 'contentType', label: 'Content Type', type: 'text', placeholder: 'marketing, legal, social...' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Adapted Content</h4>
          <p style={{fontSize: 16, lineHeight: 1.8}}>{r.adaptedContent}</p>
        </div>
        {r.overallRisk && (
          <div className="ai-result-section">
            <h4>Cultural Risk Level</h4>
            <span className={`status-badge ${r.overallRisk === 'low' ? 'status-active' : r.overallRisk === 'medium' ? 'status-pending' : 'status-urgent'}`} style={{fontSize: 14, padding: '6px 16px'}}>
              {r.overallRisk.toUpperCase()} RISK
            </span>
          </div>
        )}
        {r.culturalIssues?.length > 0 && (
          <div className="ai-result-section">
            <h4>Cultural Issues</h4>
            {r.culturalIssues.map((issue, i) => (
              <div key={i} className={`issue-card severity-${issue.severity}`}>
                <div className="issue-type">{issue.severity} severity</div>
                <div className="issue-detail">
                  <strong>{issue.issue}</strong><br/>
                  {issue.explanation}<br/>
                  {issue.suggestion && <span style={{color: '#4ade80'}}>Suggestion: {issue.suggestion}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.taboos?.length > 0 && (
          <div className="ai-result-section">
            <h4>Cultural Taboos to Avoid</h4>
            <ul>{r.taboos.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        )}
        {r.opportunities?.length > 0 && (
          <div className="ai-result-section">
            <h4>Opportunities</h4>
            <ul>{r.opportunities.map((o, i) => <li key={i}>{o}</li>)}</ul>
          </div>
        )}
        {r.colorSymbolism && <div className="ai-result-section"><h4>Color & Symbol Analysis</h4><p>{r.colorSymbolism}</p></div>}
      </>
    ),
  },
  seo: {
    title: 'SEO Localization',
    desc: 'Optimize content for international search engines with localized keywords',
    endpoint: '/ai/seo',
    fields: [
      { name: 'text', label: 'Content to Optimize', type: 'textarea', required: true },
      { name: 'keywords', label: 'Target Keywords', type: 'text', placeholder: 'keyword1, keyword2...' },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
      { name: 'targetMarket', label: 'Target Market', type: 'text', placeholder: 'Spain, Mexico, LatAm...' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Optimized Content</h4>
          <p style={{fontSize: 16, lineHeight: 1.8}}>{r.optimizedContent}</p>
        </div>
        {r.seoScore && (
          <div className="ai-result-section">
            <h4>SEO Score</h4>
            <div className="score-display">
              <div className={`score-circle ${r.seoScore >= 80 ? 'score-high' : r.seoScore >= 60 ? 'score-medium' : 'score-low'}`}>
                {r.seoScore}
              </div>
            </div>
          </div>
        )}
        {(r.seoTitle || r.metaDescription || r.urlSlug) && (
          <div className="ai-result-section">
            <h4>SEO Metadata</h4>
            {r.seoTitle && <p><strong>Title:</strong> {r.seoTitle}</p>}
            {r.metaDescription && <p style={{marginTop: 8}}><strong>Meta Description:</strong> {r.metaDescription}</p>}
            {r.urlSlug && <p style={{marginTop: 8}}><strong>URL Slug:</strong> <code style={{background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 4}}>{r.urlSlug}</code></p>}
            {r.hreflangTag && <p style={{marginTop: 8}}><strong>Hreflang:</strong> <code style={{background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 4}}>{r.hreflangTag}</code></p>}
          </div>
        )}
        {r.localizedKeywords?.length > 0 && (
          <div className="ai-result-section">
            <h4>Localized Keywords</h4>
            {r.localizedKeywords.map((kw, i) => (
              <div key={i} style={{display: 'inline-block', margin: 4}}>
                <span className="keyword-tag">
                  {kw.original} &rarr; {kw.localized}
                  {kw.searchVolume && <span style={{opacity: 0.7}}> ({kw.searchVolume})</span>}
                </span>
              </div>
            ))}
          </div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section">
            <h4>Recommendations</h4>
            <ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
          </div>
        )}
      </>
    ),
  },
  backTranslation: {
    title: 'Back-Translation Verification',
    desc: 'Verify translation accuracy by translating back to source and detecting meaning drift',
    endpoint: '/ai/back-translation',
    fields: [
      { name: 'sourceText', label: 'Original Source Text', type: 'textarea', required: true },
      { name: 'translatedText', label: 'Translated Text to Verify', type: 'textarea', required: true },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
      { name: 'domain', label: 'Domain', type: 'text', placeholder: 'legal, medical, tech...', dropdownSource: 'glossaryDomainSelect' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Back-Translation</h4>
          <p style={{fontSize: 16, lineHeight: 1.8}}>{r.backTranslation}</p>
        </div>
        {r.fidelityScore !== undefined && (
          <div className="ai-result-section">
            <h4>Fidelity Score</h4>
            <div className="score-display">
              <div className={`score-circle ${r.fidelityScore >= 85 ? 'score-high' : r.fidelityScore >= 65 ? 'score-medium' : 'score-low'}`}>
                {r.fidelityScore}
              </div>
              <div>
                <div style={{fontWeight: 600}}>{r.fidelityScore >= 85 ? 'High Fidelity' : r.fidelityScore >= 65 ? 'Moderate Fidelity' : 'Low Fidelity'}</div>
              </div>
            </div>
          </div>
        )}
        {r.meaningDrifts?.length > 0 && (
          <div className="ai-result-section">
            <h4>Meaning Drifts ({r.meaningDrifts.length})</h4>
            {r.meaningDrifts.map((d, i) => (
              <div key={i} className={`issue-card severity-${d.severity}`}>
                <div className="issue-type">{d.severity}</div>
                <div className="issue-detail">
                  <strong>Original:</strong> {d.original}<br/>
                  <strong>Translated:</strong> {d.translated}<br/>
                  <strong>Back-translated:</strong> {d.backTranslated}<br/>
                  <span style={{color: '#94a3b8', fontSize: 12}}>{d.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {r.verdict && <div className="ai-result-section"><h4>Verdict</h4><p>{r.verdict}</p></div>}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  sentiment: {
    title: 'Sentiment Analysis',
    desc: 'Analyze emotional tone across source and translated text for sentiment preservation',
    endpoint: '/ai/sentiment',
    fields: [
      { name: 'sourceText', label: 'Source Text', type: 'textarea', required: true },
      { name: 'translatedText', label: 'Translated Text (optional)', type: 'textarea', placeholder: 'Optional - for comparison' },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
    ],
    renderResult: (r) => (
      <>
        {r.sourceSentiment && (
          <div className="ai-result-section">
            <h4>Source Sentiment</h4>
            <div className="category-scores">
              <div className="category-score">
                <div className="cat-label">Polarity</div>
                <div className="cat-value" style={{fontSize: 16}}>{r.sourceSentiment.polarity}</div>
              </div>
              <div className="category-score">
                <div className="cat-label">Score</div>
                <div className="cat-value">{typeof r.sourceSentiment.score === 'number' ? Math.round(r.sourceSentiment.score * 100) + '%' : r.sourceSentiment.score}</div>
              </div>
              <div className="category-score">
                <div className="cat-label">Intensity</div>
                <div className="cat-value" style={{fontSize: 16}}>{r.sourceSentiment.intensity}</div>
              </div>
            </div>
            {r.sourceSentiment.emotions?.length > 0 && (
              <div style={{marginTop: 12}}>{r.sourceSentiment.emotions.map((e, i) => <span key={i} className="keyword-tag">{e}</span>)}</div>
            )}
          </div>
        )}
        {r.targetSentiment && (
          <div className="ai-result-section">
            <h4>Target Sentiment</h4>
            <div className="category-scores">
              <div className="category-score">
                <div className="cat-label">Polarity</div>
                <div className="cat-value" style={{fontSize: 16}}>{r.targetSentiment.polarity}</div>
              </div>
              <div className="category-score">
                <div className="cat-label">Score</div>
                <div className="cat-value">{typeof r.targetSentiment.score === 'number' ? Math.round(r.targetSentiment.score * 100) + '%' : r.targetSentiment.score}</div>
              </div>
              <div className="category-score">
                <div className="cat-label">Intensity</div>
                <div className="cat-value" style={{fontSize: 16}}>{r.targetSentiment.intensity}</div>
              </div>
            </div>
          </div>
        )}
        {r.sentimentMatch !== undefined && (
          <div className="ai-result-section">
            <h4>Sentiment Match</h4>
            <div className="score-display">
              <div className={`score-circle ${r.sentimentMatch >= 80 ? 'score-high' : r.sentimentMatch >= 60 ? 'score-medium' : 'score-low'}`}>{r.sentimentMatch}%</div>
            </div>
          </div>
        )}
        {r.drifts?.length > 0 && (
          <div className="ai-result-section">
            <h4>Sentiment Drifts</h4>
            {r.drifts.map((d, i) => (
              <div key={i} className="issue-card severity-medium">
                <div className="issue-detail">
                  <strong>Segment:</strong> {d.segment}<br/>
                  <strong>Source:</strong> {d.sourceEmotion} &rarr; <strong>Target:</strong> {d.targetEmotion}<br/>
                  {d.suggestion && <span style={{color: '#4ade80'}}>Suggestion: {d.suggestion}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.overallAnalysis && <div className="ai-result-section"><h4>Overall Analysis</h4><p>{r.overallAnalysis}</p></div>}
      </>
    ),
  },
  langDetect: {
    title: 'Language Detection',
    desc: 'Automatically detect language, dialect, script, and encoding with confidence scoring',
    endpoint: '/ai/lang-detect',
    fields: [
      { name: 'text', label: 'Text to Detect', type: 'textarea', required: true },
      { name: 'detectDialect', label: 'Detect Dialect', type: 'text', placeholder: 'yes or no' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Detected Language</h4>
          <div className="category-scores">
            <div className="category-score">
              <div className="cat-label">Language</div>
              <div className="cat-value" style={{fontSize: 18}}>{r.detectedLanguage}</div>
            </div>
            <div className="category-score">
              <div className="cat-label">Code</div>
              <div className="cat-value" style={{fontSize: 18}}>{r.languageCode}</div>
            </div>
            <div className="category-score">
              <div className="cat-label">Confidence</div>
              <div className="cat-value">{typeof r.confidence === 'number' ? Math.round(r.confidence * 100) + '%' : r.confidence}</div>
            </div>
            {r.script && <div className="category-score"><div className="cat-label">Script</div><div className="cat-value" style={{fontSize: 16}}>{r.script}</div></div>}
          </div>
        </div>
        {r.dialect && <div className="ai-result-section"><h4>Dialect</h4><p>{r.dialect}</p></div>}
        {r.formalityLevel && <div className="ai-result-section"><h4>Formality</h4><p style={{textTransform: 'capitalize'}}>{r.formalityLevel}</p></div>}
        {r.alternativePossibilities?.length > 0 && (
          <div className="ai-result-section">
            <h4>Alternative Possibilities</h4>
            {r.alternativePossibilities.map((a, i) => (
              <span key={i} className="keyword-tag">{a.language} ({typeof a.confidence === 'number' ? Math.round(a.confidence * 100) + '%' : a.confidence})</span>
            ))}
          </div>
        )}
        {r.isMultilingual && r.mixedLanguages?.length > 0 && (
          <div className="ai-result-section"><h4>Mixed Languages Detected</h4><ul>{r.mixedLanguages.map((l, i) => <li key={i}>{l}</li>)}</ul></div>
        )}
        {r.notes && <div className="ai-result-section"><h4>Notes</h4><p>{r.notes}</p></div>}
      </>
    ),
  },
  readability: {
    title: 'Readability Analysis',
    desc: 'Evaluate text complexity, reading level, and plain language compliance',
    endpoint: '/ai/readability',
    fields: [
      { name: 'text', label: 'Text to Analyze', type: 'textarea', required: true },
      { name: 'language', label: 'Language', type: 'text', placeholder: 'English' },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'general public, professionals...' },
      { name: 'targetReadingLevel', label: 'Target Reading Level', type: 'text', placeholder: '8th grade, B2 CEFR...' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Readability Score</h4>
          <div className="score-display">
            <div className={`score-circle ${r.readabilityScore >= 70 ? 'score-high' : r.readabilityScore >= 50 ? 'score-medium' : 'score-low'}`}>
              {r.readabilityScore}
            </div>
            <div>
              <div style={{fontWeight: 600}}>{r.gradeLevel || ''}</div>
              <div style={{fontSize: 13, color: '#94a3b8'}}>CEFR: {r.cefrLevel || 'N/A'}</div>
              {r.meetsTarget !== undefined && (
                <div style={{fontSize: 13, color: r.meetsTarget ? '#4ade80' : '#f87171', marginTop: 4}}>
                  {r.meetsTarget ? 'Meets target level' : 'Does not meet target level'}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="ai-result-section">
          <h4>Metrics</h4>
          <div className="category-scores">
            {r.avgSentenceLength && <div className="category-score"><div className="cat-label">Avg Sentence</div><div className="cat-value">{r.avgSentenceLength}</div></div>}
            {r.avgWordLength && <div className="category-score"><div className="cat-label">Avg Word Len</div><div className="cat-value">{r.avgWordLength}</div></div>}
            {r.complexWordPercentage !== undefined && <div className="category-score"><div className="cat-label">Complex Words</div><div className="cat-value">{r.complexWordPercentage}%</div></div>}
            {r.passiveVoicePercentage !== undefined && <div className="category-score"><div className="cat-label">Passive Voice</div><div className="cat-value">{r.passiveVoicePercentage}%</div></div>}
          </div>
        </div>
        {r.jargonTerms?.length > 0 && (
          <div className="ai-result-section">
            <h4>Jargon Terms</h4>
            {r.jargonTerms.map((j, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#fbbf24'}}>
                <div className="issue-detail"><strong>"{j.term}"</strong> &rarr; <span style={{color: '#4ade80'}}>{j.simpleAlternative}</span></div>
              </div>
            ))}
          </div>
        )}
        {r.simplifiedVersion && <div className="ai-result-section"><h4>Simplified Version</h4><p style={{fontSize: 16, lineHeight: 1.8}}>{r.simplifiedVersion}</p></div>}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  styleTransfer: {
    title: 'Style Transfer',
    desc: 'Transform text style between tones while preserving meaning',
    endpoint: '/ai/style-transfer',
    fields: [
      { name: 'text', label: 'Text to Transform', type: 'textarea', required: true },
      { name: 'sourceStyle', label: 'Source Style', type: 'text', placeholder: 'formal, academic, technical...' },
      { name: 'targetStyle', label: 'Target Style', type: 'text', required: true, placeholder: 'casual, marketing, conversational...' },
      { name: 'language', label: 'Language', type: 'text', placeholder: 'English' },
      { name: 'brandVoice', label: 'Brand Voice Guidelines', type: 'textarea', placeholder: 'Optional brand voice notes...' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Transformed Text</h4>
          <p style={{fontSize: 16, lineHeight: 1.8}}>{r.transformedText}</p>
        </div>
        {r.styleScore !== undefined && (
          <div className="ai-result-section">
            <h4>Style Score</h4>
            <div className="score-display">
              <div className={`score-circle ${r.styleScore >= 80 ? 'score-high' : r.styleScore >= 60 ? 'score-medium' : 'score-low'}`}>{r.styleScore}</div>
              {r.toneAnalysis && <div><div style={{fontWeight: 600}}>{r.toneAnalysis.source} &rarr; {r.toneAnalysis.target}</div></div>}
            </div>
          </div>
        )}
        {r.styleChanges?.length > 0 && (
          <div className="ai-result-section">
            <h4>Changes Made ({r.styleChanges.length})</h4>
            {r.styleChanges.map((c, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#a78bfa'}}>
                <div className="issue-type" style={{color: '#a78bfa'}}>{c.changeType}</div>
                <div className="issue-detail">
                  <strong>"{c.original}"</strong> &rarr; <strong style={{color: '#4ade80'}}>"{c.changed}"</strong><br/>
                  <span style={{color: '#94a3b8', fontSize: 12}}>{c.reason}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {r.notes && <div className="ai-result-section"><h4>Notes</h4><p>{r.notes}</p></div>}
      </>
    ),
  },
  summarize: {
    title: 'Content Summarization',
    desc: 'Generate multilingual summaries for translation briefing and project scoping',
    endpoint: '/ai/summarize',
    fields: [
      { name: 'text', label: 'Text to Summarize', type: 'textarea', required: true },
      { name: 'targetLength', label: 'Target Length', type: 'text', placeholder: '1 paragraph, 3 sentences, 50 words...' },
      { name: 'language', label: 'Output Language', type: 'text', placeholder: 'English' },
      { name: 'summaryType', label: 'Summary Type', type: 'text', placeholder: 'executive, technical, bullet points...' },
      { name: 'focusAreas', label: 'Focus Areas', type: 'text', placeholder: 'Key topics to emphasize...' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Summary</h4>
          <p style={{fontSize: 16, lineHeight: 1.8}}>{r.summary}</p>
        </div>
        {r.wordCount && (
          <div className="ai-result-section">
            <h4>Compression</h4>
            <div className="category-scores">
              <div className="category-score"><div className="cat-label">Original</div><div className="cat-value">{r.wordCount.original}</div></div>
              <div className="category-score"><div className="cat-label">Summary</div><div className="cat-value">{r.wordCount.summary}</div></div>
              {r.compressionRatio && <div className="category-score"><div className="cat-label">Ratio</div><div className="cat-value" style={{fontSize: 16}}>{r.compressionRatio}</div></div>}
            </div>
          </div>
        )}
        {r.bulletPoints?.length > 0 && (
          <div className="ai-result-section"><h4>Key Points</h4><ul>{r.bulletPoints.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
        )}
        {r.keyTopics?.length > 0 && (
          <div className="ai-result-section"><h4>Key Topics</h4>{r.keyTopics.map((t, i) => <span key={i} className="keyword-tag">{t}</span>)}</div>
        )}
        {r.namedEntities?.length > 0 && (
          <div className="ai-result-section">
            <h4>Named Entities</h4>
            {r.namedEntities.map((e, i) => (
              <span key={i} className="keyword-tag">{e.entity} ({e.type}{e.count ? `, x${e.count}` : ''})</span>
            ))}
          </div>
        )}
        {r.translationNotes && <div className="ai-result-section"><h4>Translation Notes</h4><p>{r.translationNotes}</p></div>}
      </>
    ),
  },
  brandVoice: {
    title: 'Brand Voice Consistency',
    desc: 'Analyze and enforce brand voice, tone, and messaging consistency across content',
    endpoint: '/ai/brand-voice',
    fields: [
      { name: 'text', label: 'Content to Check', type: 'textarea', required: true },
      { name: 'brandGuidelines', label: 'Brand Voice Guidelines', type: 'textarea', required: true, placeholder: 'Describe your brand voice, tone, personality...' },
      { name: 'language', label: 'Language', type: 'text', placeholder: 'English' },
      { name: 'contentType', label: 'Content Type', type: 'text', placeholder: 'web copy, email, social media...' },
      { name: 'brandExamples', label: 'On-brand Examples', type: 'textarea', placeholder: 'Example content that matches your brand voice...' },
    ],
    renderResult: (r) => (
      <>
        {r.overallConsistencyScore !== undefined && (
          <div className="ai-result-section">
            <h4>Brand Consistency Score</h4>
            <div className="score-display">
              <div className={`score-circle ${r.overallConsistencyScore >= 80 ? 'score-high' : r.overallConsistencyScore >= 60 ? 'score-medium' : 'score-low'}`}>
                {r.overallConsistencyScore}
              </div>
            </div>
          </div>
        )}
        {r.categories && (
          <div className="ai-result-section">
            <h4>Category Scores</h4>
            <div className="category-scores">
              {Object.entries(r.categories).map(([cat, score]) => (
                <div key={cat} className="category-score"><div className="cat-label">{cat}</div><div className="cat-value">{score}</div></div>
              ))}
            </div>
          </div>
        )}
        {r.violations?.length > 0 && (
          <div className="ai-result-section">
            <h4>Violations ({r.violations.length})</h4>
            {r.violations.map((v, i) => (
              <div key={i} className={`issue-card severity-${v.severity}`}>
                <div className="issue-type">{v.severity}</div>
                <div className="issue-detail">
                  <strong>"{v.segment}"</strong><br/>
                  <span>{v.issue}</span><br/>
                  {v.guideline && <span style={{color: '#94a3b8', fontSize: 12}}>Guideline: {v.guideline}</span>}<br/>
                  {v.suggestion && <span style={{color: '#4ade80'}}>Suggestion: {v.suggestion}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.revisedText && <div className="ai-result-section"><h4>Revised Text</h4><p style={{fontSize: 16, lineHeight: 1.8}}>{r.revisedText}</p></div>}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  subtitles: {
    title: 'Subtitle & Caption Generation',
    desc: 'Generate, translate, and format subtitles with timing and character limits',
    endpoint: '/ai/subtitles',
    fields: [
      { name: 'text', label: 'Script/Transcript', type: 'textarea', required: true },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
      { name: 'format', label: 'Format', type: 'text', placeholder: 'SRT, VTT, plain...' },
      { name: 'maxCharsPerLine', label: 'Max Chars/Line', type: 'text', placeholder: '42' },
      { name: 'maxLinesPerSubtitle', label: 'Max Lines/Subtitle', type: 'text', placeholder: '2' },
    ],
    renderResult: (r) => (
      <>
        {(r.totalSubtitles || r.avgCharsPerSubtitle) && (
          <div className="ai-result-section">
            <h4>Summary</h4>
            <div className="category-scores">
              {r.totalSubtitles && <div className="category-score"><div className="cat-label">Total</div><div className="cat-value">{r.totalSubtitles}</div></div>}
              {r.avgCharsPerSubtitle && <div className="category-score"><div className="cat-label">Avg Chars</div><div className="cat-value">{r.avgCharsPerSubtitle}</div></div>}
            </div>
          </div>
        )}
        {r.subtitles?.length > 0 && (
          <div className="ai-result-section">
            <h4>Subtitles</h4>
            {r.subtitles.map((s, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#38bdf8'}}>
                <div className="issue-type" style={{color: '#38bdf8'}}>#{s.index} | {s.startTime} &rarr; {s.endTime} | {s.charCount || ''} chars | {s.readingSpeed || ''}</div>
                <div className="issue-detail">
                  <strong>Source:</strong> {s.sourceText}<br/>
                  {s.translatedText && <><strong style={{color: '#4ade80'}}>Translated:</strong> {s.translatedText}</>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.issues?.length > 0 && (
          <div className="ai-result-section">
            <h4>Issues</h4>
            {r.issues.map((issue, i) => (
              <div key={i} className="issue-card severity-medium">
                <div className="issue-detail"><strong>#{issue.index}:</strong> {issue.issue}<br/>{issue.suggestion && <span style={{color: '#4ade80'}}>{issue.suggestion}</span>}</div>
              </div>
            ))}
          </div>
        )}
        {r.formattedOutput && <div className="ai-result-section"><h4>Formatted Output</h4><pre style={{whiteSpace: 'pre-wrap', fontSize: 13, color: '#cbd5e1'}}>{r.formattedOutput}</pre></div>}
      </>
    ),
  },
  docCompare: {
    title: 'Document Comparison',
    desc: 'Compare source and translated documents to find gaps, inconsistencies, and issues',
    endpoint: '/ai/doc-compare',
    fields: [
      { name: 'sourceText', label: 'Source Document', type: 'textarea', required: true },
      { name: 'translatedText', label: 'Translated Document', type: 'textarea', required: true },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'German', dropdownSource: 'targetLanguageSelect' },
      { name: 'comparisonType', label: 'Comparison Type', type: 'text', placeholder: 'full, structural, terminology...' },
    ],
    renderResult: (r) => (
      <>
        {r.matchScore !== undefined && (
          <div className="ai-result-section">
            <h4>Match Score</h4>
            <div className="score-display">
              <div className={`score-circle ${r.matchScore >= 85 ? 'score-high' : r.matchScore >= 65 ? 'score-medium' : 'score-low'}`}>{r.matchScore}</div>
            </div>
          </div>
        )}
        {r.untranslatedSegments?.length > 0 && (
          <div className="ai-result-section">
            <h4>Untranslated Segments</h4>
            {r.untranslatedSegments.map((s, i) => (
              <div key={i} className="issue-card severity-critical"><div className="issue-detail"><strong>{s.location}:</strong> {s.text}</div></div>
            ))}
          </div>
        )}
        {r.missingContent?.length > 0 && (
          <div className="ai-result-section">
            <h4>Missing Content</h4>
            {r.missingContent.map((m, i) => (
              <div key={i} className="issue-card severity-major"><div className="issue-detail"><strong>{m.location}:</strong> {m.sourceSegment}</div></div>
            ))}
          </div>
        )}
        {r.terminologyInconsistencies?.length > 0 && (
          <div className="ai-result-section">
            <h4>Terminology Inconsistencies</h4>
            {r.terminologyInconsistencies.map((t, i) => (
              <div key={i} className="issue-card severity-medium">
                <div className="issue-detail">
                  <strong>"{t.term}"</strong> translated as: {t.translations?.join(', ')}<br/>
                  {t.suggestion && <span style={{color: '#4ade80'}}>Use: {t.suggestion}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.summary && <div className="ai-result-section"><h4>Summary</h4><p>{r.summary}</p></div>}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  competitor: {
    title: 'Competitor Analysis',
    desc: 'Analyze competitor multilingual content strategy and localization quality',
    endpoint: '/ai/competitor',
    fields: [
      { name: 'yourContent', label: 'Your Content', type: 'textarea', required: true },
      { name: 'competitorContent', label: 'Competitor Content', type: 'textarea', required: true },
      { name: 'language', label: 'Content Language', type: 'text', placeholder: 'English' },
      { name: 'market', label: 'Target Market', type: 'text', placeholder: 'US, EU, Asia...' },
      { name: 'industry', label: 'Industry', type: 'text', placeholder: 'SaaS, ecommerce, fintech...' },
    ],
    renderResult: (r) => (
      <>
        {r.overallComparison && (
          <div className="ai-result-section">
            <h4>Overall Comparison</h4>
            <div className="category-scores">
              <div className="category-score"><div className="cat-label">Your Score</div><div className="cat-value">{r.overallComparison.yourScore}</div></div>
              <div className="category-score"><div className="cat-label">Competitor</div><div className="cat-value">{r.overallComparison.competitorScore}</div></div>
            </div>
          </div>
        )}
        {r.categories && (
          <div className="ai-result-section">
            <h4>Category Breakdown</h4>
            <div className="category-scores">
              {Object.entries(r.categories).map(([cat, scores]) => (
                <div key={cat} className="category-score">
                  <div className="cat-label">{cat}</div>
                  <div className="cat-value" style={{fontSize: 14}}>
                    {typeof scores === 'object' ? `${scores.yours || 0} vs ${scores.competitor || 0}` : scores}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {r.gaps?.length > 0 && (
          <div className="ai-result-section">
            <h4>Gaps to Close</h4>
            {r.gaps.map((g, i) => (
              <div key={i} className="issue-card severity-major" style={{borderLeftColor: '#f59e0b'}}>
                <div className="issue-type" style={{color: '#f59e0b'}}>{g.area}</div>
                <div className="issue-detail">
                  <strong>Competitor:</strong> {g.competitorApproach}<br/>
                  <span style={{color: '#4ade80'}}>Recommendation: {g.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {r.actionItems?.length > 0 && (
          <div className="ai-result-section"><h4>Action Items</h4><ul>{r.actionItems.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
        )}
      </>
    ),
  },
  projectAnalyzer: {
    title: 'AI Project Analyzer',
    desc: 'AI-powered project scoping, cost estimation, timeline prediction, and risk analysis',
    endpoint: '/ai/project-analyzer',
    fields: [
      { name: 'projectDescription', label: 'Project Description', type: 'textarea', required: true },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguages', label: 'Target Languages', type: 'text', placeholder: 'Spanish, French, German...' },
      { name: 'wordCount', label: 'Estimated Word Count', type: 'text', placeholder: '50000' },
      { name: 'contentType', label: 'Content Type', type: 'text', placeholder: 'legal, marketing, technical...' },
      { name: 'deadline', label: 'Desired Deadline', type: 'text', placeholder: '2026-06-01' },
      { name: 'budget', label: 'Budget', type: 'text', placeholder: '$10,000' },
    ],
    renderResult: (r) => (
      <>
        {r.estimatedCost && (
          <div className="ai-result-section">
            <h4>Cost Estimate</h4>
            <div className="score-display">
              <div className="score-circle score-high" style={{width: 80, height: 80, fontSize: 16}}>${typeof r.estimatedCost.total === 'number' ? r.estimatedCost.total.toLocaleString() : r.estimatedCost.total}</div>
              <div style={{fontWeight: 600}}>Total Estimated Cost</div>
            </div>
            {r.estimatedCost.perLanguage?.length > 0 && (
              <div className="category-scores" style={{marginTop: 12}}>
                {r.estimatedCost.perLanguage.map((l, i) => (
                  <div key={i} className="category-score"><div className="cat-label">{l.language}</div><div className="cat-value" style={{fontSize: 16}}>${l.cost}</div></div>
                ))}
              </div>
            )}
          </div>
        )}
        {r.timeline && (
          <div className="ai-result-section">
            <h4>Timeline ({r.timeline.totalDays} days)</h4>
            {r.timeline.milestones?.map((m, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#38bdf8'}}>
                <div className="issue-type" style={{color: '#38bdf8'}}>{m.phase} ({m.days} days)</div>
                <div className="issue-detail">{m.description}</div>
              </div>
            ))}
          </div>
        )}
        {r.complexityScore !== undefined && (
          <div className="ai-result-section">
            <h4>Complexity</h4>
            <div className="score-display">
              <div className={`score-circle ${r.complexityScore <= 4 ? 'score-high' : r.complexityScore <= 7 ? 'score-medium' : 'score-low'}`}>{r.complexityScore}/10</div>
            </div>
          </div>
        )}
        {r.risks?.length > 0 && (
          <div className="ai-result-section">
            <h4>Risk Factors</h4>
            {r.risks.map((risk, i) => (
              <div key={i} className={`issue-card severity-${risk.probability === 'high' ? 'critical' : risk.probability === 'medium' ? 'major' : 'minor'}`}>
                <div className="issue-type">{risk.probability} probability</div>
                <div className="issue-detail"><strong>{risk.risk}</strong><br/>{risk.mitigation && <span style={{color: '#4ade80'}}>Mitigation: {risk.mitigation}</span>}</div>
              </div>
            ))}
          </div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  clientInsights: {
    title: 'AI Client Insights',
    desc: 'Predict client needs, identify upsell opportunities, and detect churn risk',
    endpoint: '/ai/client-insights',
    fields: [
      { name: 'clientProfile', label: 'Client Profile', type: 'textarea', required: true, placeholder: 'Company, industry, country, history...' },
      { name: 'projectHistory', label: 'Project History', type: 'textarea', placeholder: 'Summary of past projects...' },
      { name: 'communicationSamples', label: 'Communication Samples', type: 'textarea', placeholder: 'Recent emails/messages...' },
      { name: 'industry', label: 'Industry', type: 'text', placeholder: 'tech, pharma, legal...' },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Client Overview</h4>
          <div className="category-scores">
            {r.clientTier && <div className="category-score"><div className="cat-label">Client Tier</div><div className="cat-value" style={{fontSize: 16, textTransform: 'capitalize'}}>{r.clientTier}</div></div>}
            {r.satisfactionEstimate && <div className="category-score"><div className="cat-label">Satisfaction</div><div className="cat-value">{r.satisfactionEstimate}%</div></div>}
          </div>
        </div>
        {r.churnRisk && (
          <div className="ai-result-section">
            <h4>Churn Risk</h4>
            <span className={`status-badge ${r.churnRisk.level === 'low' ? 'status-active' : r.churnRisk.level === 'medium' ? 'status-pending' : 'status-urgent'}`} style={{fontSize: 14, padding: '6px 16px'}}>
              {(r.churnRisk.level || '').toUpperCase()} RISK
            </span>
            {r.churnRisk.preventionActions?.length > 0 && (
              <ul style={{marginTop: 12}}>{r.churnRisk.preventionActions.map((a, i) => <li key={i}>{a}</li>)}</ul>
            )}
          </div>
        )}
        {r.upsellOpportunities?.length > 0 && (
          <div className="ai-result-section">
            <h4>Upsell Opportunities</h4>
            {r.upsellOpportunities.map((o, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#22c55e'}}>
                <div className="issue-type" style={{color: '#22c55e'}}>{o.estimatedValue ? `$${o.estimatedValue}` : 'Opportunity'}</div>
                <div className="issue-detail"><strong>{o.opportunity}</strong><br/>{o.approach}</div>
              </div>
            ))}
          </div>
        )}
        {r.predictedNeeds?.length > 0 && (
          <div className="ai-result-section">
            <h4>Predicted Needs</h4>
            {r.predictedNeeds.map((n, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#818cf8'}}>
                <div className="issue-type" style={{color: '#818cf8'}}>{n.likelihood} likelihood</div>
                <div className="issue-detail"><strong>{n.service}</strong><br/>{n.reasoning}</div>
              </div>
            ))}
          </div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  translatorMatcher: {
    title: 'AI Translator Matcher',
    desc: 'AI-powered translator assignment based on skills, availability, and project requirements',
    endpoint: '/ai/translator-matcher',
    fields: [
      { name: 'projectRequirements', label: 'Project Requirements', type: 'textarea', required: true },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Japanese', dropdownSource: 'targetLanguageSelect' },
      { name: 'domain', label: 'Domain', type: 'text', placeholder: 'medical, legal, tech...', dropdownSource: 'glossaryDomainSelect' },
      { name: 'availableTranslators', label: 'Available Translators', type: 'textarea', placeholder: 'List translators with skills...' },
      { name: 'deadline', label: 'Deadline', type: 'text', placeholder: '2026-06-01' },
      { name: 'qualityTier', label: 'Quality Tier', type: 'text', placeholder: 'standard, premium, enterprise' },
    ],
    renderResult: (r) => (
      <>
        {/* Top matches from structured DB-enhanced result */}
        {r.top_matches?.length > 0 && (
          <div className="ai-result-section">
            <h4>Top Matches</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              {r.top_matches.map((m, i) => (
                <div key={i} style={{
                  background: '#1e293b', border: `1px solid ${i === 0 ? '#4ade80' : i === 1 ? '#38bdf8' : '#334155'}`,
                  borderRadius: 10, padding: '14px 16px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <span style={{
                        background: i === 0 ? '#4ade80' : i === 1 ? '#38bdf8' : '#64748b',
                        color: '#000', borderRadius: '50%', width: 24, height: 24,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700
                      }}>#{i + 1}</span>
                      <strong style={{fontSize: 15}}>{m.translator_name}</strong>
                    </div>
                    <span style={{
                      color: m.match_score >= 80 ? '#4ade80' : m.match_score >= 60 ? '#fbbf24' : '#f87171',
                      fontWeight: 700, fontSize: 18
                    }}>{m.match_score}%</span>
                  </div>
                  {/* Score bar */}
                  <div style={{background: '#0f172a', borderRadius: 4, height: 8, marginBottom: 10}}>
                    <div style={{
                      background: m.match_score >= 80 ? '#4ade80' : m.match_score >= 60 ? '#fbbf24' : '#f87171',
                      height: '100%', borderRadius: 4,
                      width: `${m.match_score}%`, transition: 'width 0.3s'
                    }} />
                  </div>
                  {m.reasons?.length > 0 && (
                    <ul style={{margin: 0, paddingLeft: 16, color: '#94a3b8', fontSize: 13}}>
                      {m.reasons.map((r, j) => <li key={j}>{r}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Legacy rankedCandidates fallback */}
        {!r.top_matches?.length && r.rankedCandidates?.length > 0 && (
          <div className="ai-result-section">
            <h4>Ranked Candidates</h4>
            {r.rankedCandidates.map((c, i) => (
              <div key={i} style={{
                background: '#1e293b', border: `1px solid ${i === 0 ? '#4ade80' : '#334155'}`,
                borderRadius: 10, padding: '14px 16px', marginBottom: 10
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                  <strong style={{fontSize: 15}}>#{c.rank} {c.name}</strong>
                  <span style={{color: '#4ade80', fontWeight: 700, fontSize: 18}}>{c.matchScore}%</span>
                </div>
                <div style={{background: '#0f172a', borderRadius: 4, height: 8, marginBottom: 10}}>
                  <div style={{background: '#4ade80', height: '100%', borderRadius: 4, width: `${c.matchScore}%`}} />
                </div>
                {c.strengths?.length > 0 && <p style={{color: '#4ade80', fontSize: 13, margin: '4px 0'}}>✓ {c.strengths.join(' · ')}</p>}
                {c.concerns?.length > 0 && <p style={{color: '#fbbf24', fontSize: 13, margin: '4px 0'}}>⚠ {c.concerns.join(' · ')}</p>}
              </div>
            ))}
          </div>
        )}
        {(r.recommendation || r.teamRecommendation) && (
          <div className="ai-result-section">
            <h4>Recommendation</h4>
            <p style={{lineHeight: 1.7}}>{typeof (r.recommendation || r.teamRecommendation) === 'string' ? (r.recommendation || r.teamRecommendation) : JSON.stringify(r.recommendation || r.teamRecommendation)}</p>
          </div>
        )}
        {r.riskFactors?.length > 0 && (
          <div className="ai-result-section"><h4>Risk Factors</h4><ul>{r.riskFactors.map((f, i) => <li key={i} style={{color: '#fbbf24'}}>{f}</li>)}</ul></div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  glossaryGen: {
    title: 'AI Glossary Generator',
    desc: 'Auto-generate domain-specific bilingual glossaries from reference documents',
    endpoint: '/ai/glossary-gen',
    fields: [
      { name: 'referenceText', label: 'Reference Text', type: 'textarea', required: true },
      { name: 'sourceLanguage', label: 'Source Language', type: 'text', placeholder: 'English', dropdownSource: 'sourceLanguageSelect' },
      { name: 'targetLanguage', label: 'Target Language', type: 'text', placeholder: 'Spanish', dropdownSource: 'targetLanguageSelect' },
      { name: 'domain', label: 'Domain', type: 'text', placeholder: 'medical, legal, fintech...', dropdownSource: 'glossaryDomainSelect' },
      { name: 'existingTerms', label: 'Existing Terms (exclude)', type: 'textarea', placeholder: 'Terms already in glossary...' },
    ],
    renderResult: (r) => (
      <>
        {r.totalTerms !== undefined && (
          <div className="ai-result-section">
            <h4>Glossary Summary</h4>
            <div className="category-scores">
              <div className="category-score"><div className="cat-label">Total Terms</div><div className="cat-value">{r.totalTerms}</div></div>
              {r.domainCoverage && <div className="category-score"><div className="cat-label">Coverage</div><div className="cat-value" style={{fontSize: 16, textTransform: 'capitalize'}}>{r.domainCoverage}</div></div>}
            </div>
          </div>
        )}
        {r.glossaryEntries?.length > 0 && (
          <div className="ai-result-section">
            <h4>Generated Glossary</h4>
            {r.glossaryEntries.map((e, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: e.needsApproval ? '#fbbf24' : '#4ade80'}}>
                <div className="issue-type" style={{color: e.needsApproval ? '#fbbf24' : '#4ade80'}}>
                  {e.partOfSpeech || 'term'} {e.needsApproval ? '- NEEDS APPROVAL' : ''}
                </div>
                <div className="issue-detail">
                  <strong style={{fontSize: 15}}>{e.term}</strong> &rarr; <strong style={{color: '#4ade80'}}>{e.translation}</strong><br/>
                  {e.definition && <span>{e.definition}</span>}<br/>
                  {e.context && <span style={{color: '#94a3b8', fontSize: 12}}>Context: {e.context}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.ambiguousTerms?.length > 0 && (
          <div className="ai-result-section">
            <h4>Ambiguous Terms (Need Review)</h4>
            {r.ambiguousTerms.map((t, i) => (
              <div key={i} className="issue-card severity-medium">
                <div className="issue-detail">
                  <strong>{t.term}</strong><br/>
                  Options: {t.possibleTranslations?.join(', ')}<br/>
                  <span style={{color: '#4ade80'}}>{t.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  orderOptimizer: {
    title: 'AI Order Optimizer',
    desc: 'Optimize order batching, scheduling, and cost efficiency across translation orders',
    endpoint: '/ai/order-optimizer',
    fields: [
      { name: 'orders', label: 'Pending Orders', type: 'textarea', required: true, placeholder: 'List orders with languages, word counts, deadlines, priorities...' },
      { name: 'availableResources', label: 'Available Resources', type: 'textarea', placeholder: 'Available translators and capacity...' },
      { name: 'constraints', label: 'Constraints', type: 'textarea', placeholder: 'Budget limits, priority rules...' },
    ],
    renderResult: (r) => (
      <>
        {r.costSavings && (
          <div className="ai-result-section">
            <h4>Cost Savings</h4>
            <div className="category-scores">
              <div className="category-score"><div className="cat-label">Original</div><div className="cat-value" style={{fontSize: 18}}>${r.costSavings.original}</div></div>
              <div className="category-score"><div className="cat-label">Optimized</div><div className="cat-value" style={{fontSize: 18}}>${r.costSavings.optimized}</div></div>
              <div className="category-score"><div className="cat-label">Saved</div><div className="cat-value" style={{fontSize: 18, color: '#4ade80'}}>${r.costSavings.saved}</div></div>
              {r.costSavings.percentage && <div className="category-score"><div className="cat-label">Savings</div><div className="cat-value">{r.costSavings.percentage}%</div></div>}
            </div>
          </div>
        )}
        {r.timelineFeasibility && (
          <div className="ai-result-section">
            <h4>Timeline Feasibility</h4>
            <span className={`status-badge ${r.timelineFeasibility === 'all_on_time' ? 'status-active' : r.timelineFeasibility === 'some_at_risk' ? 'status-pending' : 'status-urgent'}`} style={{fontSize: 14, padding: '6px 16px'}}>
              {r.timelineFeasibility.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        )}
        {r.optimizedSchedule?.length > 0 && (
          <div className="ai-result-section">
            <h4>Optimized Schedule</h4>
            {r.optimizedSchedule.map((b, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#38bdf8'}}>
                <div className="issue-type" style={{color: '#38bdf8'}}>Batch {b.batch}</div>
                <div className="issue-detail">
                  <strong>Assigned to:</strong> {b.assignedTo}<br/>
                  <strong>Period:</strong> {b.startDate} - {b.endDate}<br/>
                  {b.totalWords && <span>Words: {b.totalWords} | </span>}
                  {b.cost && <span>Cost: ${b.cost}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.bottlenecks?.length > 0 && (
          <div className="ai-result-section">
            <h4>Bottlenecks</h4>
            {r.bottlenecks.map((b, i) => (
              <div key={i} className="issue-card severity-major"><div className="issue-detail"><strong>{b.resource}:</strong> {b.issue}<br/><span style={{color: '#4ade80'}}>{b.solution}</span></div></div>
            ))}
          </div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  invoiceAnalyzer: {
    title: 'AI Invoice Analyzer',
    desc: 'Analyze invoicing patterns, forecast revenue, and optimize pricing',
    endpoint: '/ai/invoice-analyzer',
    fields: [
      { name: 'invoiceData', label: 'Invoice Data', type: 'textarea', required: true, placeholder: 'Invoice history: amounts, dates, clients, services...' },
      { name: 'period', label: 'Analysis Period', type: 'text', placeholder: 'Q1 2026' },
      { name: 'targetRevenue', label: 'Revenue Target', type: 'text', placeholder: '$100,000' },
      { name: 'pricingModel', label: 'Current Pricing Model', type: 'text', placeholder: 'Per word, flat rate, hourly...' },
    ],
    renderResult: (r) => (
      <>
        {r.revenueSummary && (
          <div className="ai-result-section">
            <h4>Revenue Summary</h4>
            <div className="category-scores">
              {r.revenueSummary.total && <div className="category-score"><div className="cat-label">Total</div><div className="cat-value" style={{fontSize: 18}}>${typeof r.revenueSummary.total === 'number' ? r.revenueSummary.total.toLocaleString() : r.revenueSummary.total}</div></div>}
              {r.revenueSummary.average && <div className="category-score"><div className="cat-label">Average</div><div className="cat-value">${r.revenueSummary.average}</div></div>}
              {r.revenueSummary.trend && <div className="category-score"><div className="cat-label">Trend</div><div className="cat-value" style={{fontSize: 16, textTransform: 'capitalize', color: r.revenueSummary.trend === 'growing' ? '#4ade80' : r.revenueSummary.trend === 'declining' ? '#f87171' : '#fbbf24'}}>{r.revenueSummary.trend}</div></div>}
            </div>
          </div>
        )}
        {r.forecast && (
          <div className="ai-result-section">
            <h4>Revenue Forecast</h4>
            <div className="category-scores">
              {r.forecast.nextMonth && <div className="category-score"><div className="cat-label">Next Month</div><div className="cat-value" style={{fontSize: 16}}>${typeof r.forecast.nextMonth === 'number' ? r.forecast.nextMonth.toLocaleString() : r.forecast.nextMonth}</div></div>}
              {r.forecast.nextQuarter && <div className="category-score"><div className="cat-label">Next Quarter</div><div className="cat-value" style={{fontSize: 16}}>${typeof r.forecast.nextQuarter === 'number' ? r.forecast.nextQuarter.toLocaleString() : r.forecast.nextQuarter}</div></div>}
              {r.forecast.confidence && <div className="category-score"><div className="cat-label">Confidence</div><div className="cat-value">{Math.round(r.forecast.confidence * 100)}%</div></div>}
            </div>
          </div>
        )}
        {r.overdueRisk?.length > 0 && (
          <div className="ai-result-section">
            <h4>Overdue Risk</h4>
            {r.overdueRisk.map((o, i) => (
              <div key={i} className={`issue-card severity-${o.riskLevel === 'high' ? 'critical' : o.riskLevel === 'medium' ? 'major' : 'minor'}`}>
                <div className="issue-type">{o.riskLevel} risk</div>
                <div className="issue-detail"><strong>{o.invoice}</strong><br/>{o.predictedPayDate && <span>Predicted: {o.predictedPayDate}</span>}</div>
              </div>
            ))}
          </div>
        )}
        {r.pricingRecommendations?.length > 0 && (
          <div className="ai-result-section">
            <h4>Pricing Recommendations</h4>
            {r.pricingRecommendations.map((p, i) => (
              <div key={i} className="issue-card severity-minor" style={{borderLeftColor: '#22c55e'}}>
                <div className="issue-detail">
                  <strong>{p.service}:</strong> {p.currentRate} &rarr; <strong style={{color: '#4ade80'}}>{p.suggestedRate}</strong><br/>
                  <span style={{color: '#94a3b8', fontSize: 12}}>{p.reasoning}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  biasCheck: {
    title: 'Bias & Inclusivity Checker',
    desc: 'Detect gender bias, ageism, cultural insensitivity, and non-inclusive language',
    endpoint: '/ai/bias-check',
    fields: [
      { name: 'text', label: 'Text to Analyze', type: 'textarea', required: true },
      { name: 'language', label: 'Language', type: 'text', placeholder: 'English' },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'global, US, EU...' },
      { name: 'guidelines', label: 'Inclusivity Guidelines', type: 'textarea', placeholder: 'Optional inclusivity standards...' },
    ],
    renderResult: (r) => (
      <>
        {r.inclusivityScore !== undefined && (
          <div className="ai-result-section">
            <h4>Inclusivity Score</h4>
            <div className="score-display">
              <div className={`score-circle ${r.inclusivityScore >= 80 ? 'score-high' : r.inclusivityScore >= 60 ? 'score-medium' : 'score-low'}`}>{r.inclusivityScore}</div>
            </div>
          </div>
        )}
        {r.genderAnalysis && (
          <div className="ai-result-section">
            <h4>Gender Analysis</h4>
            <div className="category-scores">
              {r.genderAnalysis.genderedTerms !== undefined && <div className="category-score"><div className="cat-label">Gendered</div><div className="cat-value">{r.genderAnalysis.genderedTerms}</div></div>}
              {r.genderAnalysis.neutralTerms !== undefined && <div className="category-score"><div className="cat-label">Neutral</div><div className="cat-value">{r.genderAnalysis.neutralTerms}</div></div>}
              {r.genderAnalysis.ratio && <div className="category-score"><div className="cat-label">Ratio</div><div className="cat-value" style={{fontSize: 16}}>{r.genderAnalysis.ratio}</div></div>}
            </div>
          </div>
        )}
        {r.issues?.length > 0 && (
          <div className="ai-result-section">
            <h4>Issues Found ({r.issues.length})</h4>
            {r.issues.map((issue, i) => (
              <div key={i} className={`issue-card severity-${issue.severity}`}>
                <div className="issue-type" style={{color: issue.category === 'gender' ? '#f472b6' : issue.category === 'culture' ? '#fbbf24' : '#60a5fa'}}>
                  {issue.category}
                </div>
                <div className="issue-detail">
                  <strong>"{issue.text}"</strong><br/>
                  {issue.explanation}<br/>
                  {issue.inclusiveAlternative && <span style={{color: '#4ade80'}}>Use instead: "{issue.inclusiveAlternative}"</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {r.revisedText && <div className="ai-result-section"><h4>Inclusive Version</h4><p style={{fontSize: 16, lineHeight: 1.8}}>{r.revisedText}</p></div>}
        {r.positiveNotes?.length > 0 && (
          <div className="ai-result-section"><h4>Positive Notes</h4><ul>{r.positiveNotes.map((n, i) => <li key={i}>{n}</li>)}</ul></div>
        )}
        {r.recommendations?.length > 0 && (
          <div className="ai-result-section"><h4>Recommendations</h4><ul>{r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>
        )}
      </>
    ),
  },
  generateQuote: {
    title: 'Project Quote Generator',
    desc: 'Generate accurate pricing quotes for translation projects using AI',
    endpoint: '/ai/generate-quote',
    fields: [
      { name: 'projectId', label: 'Project ID', type: 'number', required: true },
    ],
    renderResult: (r) => (
      <>
        <div className="ai-result-section">
          <h4>Project Cost Summary</h4>
          <div style={{
            background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: 12, padding: '20px 24px', textAlign: 'center', marginBottom: 16
          }}>
            <div style={{fontSize: 13, color: '#94a3b8', marginBottom: 4}}>Total Cost</div>
            <div style={{fontSize: 40, fontWeight: 800, color: '#4ade80'}}>
              ${typeof r.total_cost === 'number' ? r.total_cost.toLocaleString() : r.total_cost}
            </div>
            {r.payment_terms && <div style={{fontSize: 13, color: '#94a3b8', marginTop: 6}}>{r.payment_terms}</div>}
          </div>
        </div>
        <div className="ai-result-section">
          <h4>Project Details</h4>
          <div className="category-scores">
            {r.total_words !== undefined && <div className="category-score"><div className="cat-label">Total Words</div><div className="cat-value">{Number(r.total_words).toLocaleString()}</div></div>}
            {r.estimated_hours !== undefined && <div className="category-score"><div className="cat-label">Est. Hours</div><div className="cat-value">{r.estimated_hours}</div></div>}
            {r.base_rate_per_word !== undefined && <div className="category-score"><div className="cat-label">Rate/Word</div><div className="cat-value">${r.base_rate_per_word}</div></div>}
          </div>
        </div>
        {r.delivery_date_estimate && (
          <div className="ai-result-section">
            <h4>Delivery Estimate</h4>
            <p style={{fontSize: 20, fontWeight: 700, color: '#38bdf8'}}>{r.delivery_date_estimate}</p>
          </div>
        )}
        {r.translator_recommendation && (
          <div className="ai-result-section">
            <h4>Translator Recommendation</h4>
            <p>{r.translator_recommendation}</p>
          </div>
        )}
        {r.breakdown && (
          <div className="ai-result-section">
            <h4>Cost Breakdown</h4>
            <div className="category-scores">
              {Object.entries(r.breakdown).map(([k, v]) => (
                <div key={k} className="category-score">
                  <div className="cat-label" style={{textTransform: 'capitalize'}}>{k}</div>
                  <div className="cat-value">${typeof v === 'number' ? v.toLocaleString() : v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    ),
  },
};

export default function AIPage({ type }) {
  const config = configs[type];
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [resultMeta, setResultMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownData, setDropdownData] = useState({});
  const [activeSample, setActiveSample] = useState(null);

  const currentSamples = samples[type] || [];

  // Fetch dropdown data for fields that have dropdownSource
  const fetchDropdowns = useCallback(async () => {
    const sourcesNeeded = new Set();
    config.fields.forEach(f => {
      if (f.dropdownSource) sourcesNeeded.add(f.dropdownSource);
    });

    const fetched = {};
    for (const src of sourcesNeeded) {
      const def = dropdownSources[src];
      if (!def) continue;
      try {
        const { data } = await api.get(def.endpoint);
        let options = data.map(row => ({
          label: def.labelFn ? def.labelFn(row) : row[def.labelField],
          value: String(row[def.valueField]),
          extra: def.extraFields ? def.extraFields.map(ef => row[ef]).filter(Boolean).join(' | ') : '',
        }));
        if (def.unique) {
          const seen = new Set();
          options = options.filter(o => {
            if (!o.value || seen.has(o.value)) return false;
            seen.add(o.value);
            return true;
          });
        }
        fetched[src] = options;
      } catch (err) {
        fetched[src] = [];
      }
    }
    setDropdownData(fetched);
  }, [config.fields]);

  useEffect(() => {
    fetchDropdowns();
    setFormData({});
    setResult(null);
    setResultMeta({});
    setError('');
    setActiveSample(null);
  }, [type, fetchDropdowns]);

  const loadSample = (idx) => {
    const sample = currentSamples[idx];
    if (sample) {
      setFormData({ ...sample.data });
      setActiveSample(idx);
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post(config.endpoint, formData);
      setResult(data.result);
      setResultMeta({ glossaryApplied: data.glossaryApplied });
    } catch (err) {
      setError(err.response?.data?.error || 'AI request failed. Check your OpenRouter API key.');
    }
    setLoading(false);
  };

  const renderField = (f) => {
    const ddOptions = f.dropdownSource ? dropdownData[f.dropdownSource] : null;

    if (f.type === 'textarea') {
      return (
        <textarea
          value={formData[f.name] || ''}
          onChange={e => setFormData({...formData, [f.name]: e.target.value})}
          placeholder={f.placeholder}
          required={f.required}
          rows={4}
        />
      );
    }

    // If has dropdown options, show a combo: dropdown + text input
    if (ddOptions && ddOptions.length > 0) {
      return (
        <div className="combo-field">
          <select
            value={formData[f.name] || ''}
            onChange={e => setFormData({...formData, [f.name]: e.target.value})}
            className="combo-select"
          >
            <option value="">-- Select from database --</option>
            {ddOptions.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}{opt.extra ? ` (${opt.extra})` : ''}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={formData[f.name] || ''}
            onChange={e => setFormData({...formData, [f.name]: e.target.value})}
            placeholder={f.placeholder || 'Or type custom value...'}
            className="combo-input"
          />
        </div>
      );
    }

    return (
      <input
        type="text"
        value={formData[f.name] || ''}
        onChange={e => setFormData({...formData, [f.name]: e.target.value})}
        placeholder={f.placeholder}
        required={f.required}
      />
    );
  };

  return (
    <div className="ai-page">
      <div className="ai-page-header">
        <h1>{config.title}</h1>
        <p>{config.desc}</p>
      </div>

      {/* Sample Data Buttons */}
      {currentSamples.length > 0 && (
        <div className="sample-buttons">
          <span className="sample-label">Load Sample:</span>
          {currentSamples.map((sample, idx) => (
            <button
              key={idx}
              className={`sample-btn ${activeSample === idx ? 'sample-active' : ''}`}
              onClick={() => loadSample(idx)}
              type="button"
            >
              {sample.label}
            </button>
          ))}
        </div>
      )}

      <div className="ai-form">
        <form onSubmit={handleSubmit}>
          {config.fields.map(f => (
            <div key={f.name} className="form-group">
              <label>
                {f.label}
                {f.dropdownSource && dropdownData[f.dropdownSource]?.length > 0 && (
                  <span className="field-badge">DB</span>
                )}
              </label>
              {renderField(f)}
            </div>
          ))}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{marginTop: 8}}>
            {loading ? 'Processing with AI...' : `Run ${config.title}`}
          </button>
        </form>
      </div>

      {loading && (
        <div className="ai-result">
          <div className="loading-spinner"><div className="spinner"></div> AI is analyzing your content...</div>
        </div>
      )}

      {error && (
        <div className="ai-result" style={{borderColor: 'rgba(239, 68, 68, 0.3)'}}>
          <h3 style={{color: '#f87171'}}>Error</h3>
          <p style={{color: '#f87171'}}>{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="ai-result">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
            <h3 style={{margin: 0}}>AI Analysis Results</h3>
            {resultMeta.glossaryApplied && (
              <span style={{
                background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 12, padding: '3px 10px', fontSize: 12, fontWeight: 600
              }}>
                📚 Glossary terms applied
              </span>
            )}
          </div>
          {config.renderResult(result)}
        </div>
      )}
    </div>
  );
}
