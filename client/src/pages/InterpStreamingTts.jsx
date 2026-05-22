import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const ENDPOINT = '/interp/streaming-tts';
const TITLE = 'Streaming TTS';

const FIELDS = [
  { name: 'session_token', label: 'Session Token', type: 'text' },
  { name: 'user_id', label: 'User ID', type: 'number' },
  { name: 'language_code', label: 'Language Code', type: 'text' },
  { name: 'voice_id', label: 'Voice ID', type: 'text' },
  { name: 'tts_engine', label: 'TTS Engine', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'paused', 'completed', 'error'] },
  { name: 'input_text', label: 'Input Text', type: 'textarea' },
  { name: 'audio_format', label: 'Audio Format', type: 'text' },
  { name: 'sample_rate', label: 'Sample Rate (Hz)', type: 'number' },
  { name: 'speaking_rate', label: 'Speaking Rate', type: 'number' },
  { name: 'pitch', label: 'Pitch', type: 'number' },
  { name: 'volume_gain', label: 'Volume Gain (dB)', type: 'number' },
];

const AI_VERBS = [
  'assess-voice-quality',
  'recommend-voice-id',
  'detect-pronunciation-issues',
  'suggest-speaking-rate',
  'optimize-pitch',
  'classify-text-type',
  'detect-ssml-opportunities',
  'generate-ssml-markup',
  'predict-audio-duration',
  'flag-problematic-phrases',
  'recommend-tts-engine',
  'score-naturalness',
  'detect-emphasis-points',
  'suggest-pause-placement',
  'check-language-voice-compatibility',
  'estimate-output-size',
];

function AIVerbsPanel({ item, onClose }) {
  const [selectedVerb, setSelectedVerb] = useState(AI_VERBS[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runVerb = async () => {
    setLoading(true); setResult(null); setError(null);
    try {
      const { data } = await api.post(`${ENDPOINT}/ai/${selectedVerb}`, item || {});
      setResult(data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>AI Verbs — {TITLE}</h2>
        <div className="form-group">
          <label>Select AI Verb</label>
          <select value={selectedVerb} onChange={e => setSelectedVerb(e.target.value)}>
            {AI_VERBS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={runVerb} disabled={loading}>{loading ? 'Running...' : 'Run Verb'}</button>
        </div>
        {error && <div style={{ marginTop: 12, padding: 12, background: '#fee2e2', borderRadius: 6, color: '#b91c1c' }}>{error}</div>}
        {result && (
          <div style={{ marginTop: 12, padding: 12, background: '#f0fdf4', borderRadius: 6 }}>
            <strong>Verb:</strong> {result.verb}<br /><strong>Generated At:</strong> {result.generatedAt}<br />
            <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 13, color: '#1e293b' }}>
              {typeof result.result === 'object' ? JSON.stringify(result.result, null, 2) : String(result.result)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterpStreamingTts() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiTarget, setAiTarget] = useState(null);

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`${ENDPOINT}?page=${p}&limit=20`);
      if (data && data.data && data.pagination) { setItems(data.data); setPagination(data.pagination); }
      else setItems(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(page); }, [fetchItems, page]);

  const openNew = () => { setFormData({}); setEditing(null); setShowForm(true); };
  const openEdit = (item) => {
    const d = {}; FIELDS.forEach(f => { d[f.name] = item[f.name] || ''; });
    setFormData(d); setEditing(item); setShowForm(true); setSelected(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`${ENDPOINT}/${editing.id}`, formData);
      else await api.post(ENDPOINT, formData);
      setShowForm(false); fetchItems(page);
    } catch (e) { alert(e.response?.data?.error || 'Error saving'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await api.delete(`${ENDPOINT}/${id}`); setSelected(null); fetchItems(page); }
    catch (e) { alert(e.response?.data?.error || 'Error deleting'); }
  };

  const displayCols = FIELDS.slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1>{TITLE}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { setAiTarget(null); setShowAI(true); }}>AI Verbs</button>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openNew}>+ New Session</button>
        </div>
      </div>
      <div className="table-container"><div className="table-wrapper">
        {loading ? <div className="loading-spinner"><div className="spinner" /> Loading...</div> : (
          <table>
            <thead><tr><th>ID</th>{displayCols.map(f => <th key={f.name}>{f.label}</th>)}<th>Actions</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                  <td>{item.id}</td>
                  {displayCols.map(f => <td key={f.name}>{f.name === 'status' ? <span className={`status-badge status-${item[f.name]}`}>{item[f.name]}</span> : (item[f.name] != null ? String(item[f.name]) : '-')}</td>)}
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" style={{ marginRight: 4 }} onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setAiTarget(item); setShowAI(true); }}>AI</button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={displayCols.length + 2} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No records found</td></tr>}
            </tbody>
          </table>
        )}
      </div></div>
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '16px 0' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>&larr; Prev</button>
          <span style={{ color: '#64748b', fontSize: 14 }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>Next &rarr;</button>
        </div>
      )}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
            <h2>{TITLE} Details</h2>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">ID</div><div className="detail-value">{selected.id}</div></div>
              {FIELDS.map(f => (
                <div key={f.name} className={`detail-item ${f.type === 'textarea' ? 'full-width' : ''}`}>
                  <div className="detail-label">{f.label}</div><div className="detail-value">{selected[f.name] != null ? String(selected[f.name]) : '-'}</div>
                </div>
              ))}
              {selected.created_at && <div className="detail-item"><div className="detail-label">Created</div><div className="detail-value">{new Date(selected.created_at).toLocaleString()}</div></div>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => { setAiTarget(selected); setShowAI(true); setSelected(null); }}>AI Verbs</button>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(selected)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            <h2>{editing ? 'Edit' : 'New'} {TITLE} Session</h2>
            <form onSubmit={handleSubmit}>
              {FIELDS.map(f => (
                <div key={f.name} className="form-group">
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={formData[f.name] || ''} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}>
                      <option value="">Select...</option>{f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea value={formData[f.name] || ''} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} rows={3} />
                  ) : (
                    <input type={f.type === 'number' ? 'number' : 'text'} value={formData[f.name] || ''} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} />
                  )}
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAI && <AIVerbsPanel item={aiTarget} onClose={() => setShowAI(false)} />}
    </div>
  );
}
