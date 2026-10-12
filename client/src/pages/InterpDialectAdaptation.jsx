import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import InterpretationAIWorkspace from '../components/InterpretationAIWorkspace';
import interpretationAISchemas from '../components/interpretationAISchemas';

const ENDPOINT = '/interp/dialect-adaptation';
const TITLE = 'Dialect Adaptation';

const FIELDS = [
  { name: 'session_token', label: 'Session Token', type: 'text' },
  { name: 'user_id', label: 'User ID', type: 'number' },
  { name: 'base_language', label: 'Base Language', type: 'text' },
  { name: 'source_dialect', label: 'Source Dialect', type: 'text' },
  { name: 'target_dialect', label: 'Target Dialect', type: 'text' },
  { name: 'region', label: 'Region', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'processing', 'completed', 'error'] },
  { name: 'input_text', label: 'Input Text', type: 'textarea' },
  { name: 'adapted_text', label: 'Adapted Text', type: 'textarea' },
  { name: 'adaptation_score', label: 'Adaptation Score', type: 'number' },
  { name: 'formality_level', label: 'Formality Level', type: 'select', options: ['formal', 'informal', 'neutral'] },
];

function AIVerbsPanel({ item, rows, available, unavailableReason, retry, onClose }) {
  return <InterpretationAIWorkspace title={TITLE} endpoint={ENDPOINT} tools={interpretationAISchemas[ENDPOINT]} item={item} rows={rows} available={available} unavailableReason={unavailableReason} retry={retry} onClose={onClose} />;
}

export default function InterpDialectAdaptation() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiTarget, setAiTarget] = useState(null);

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true); setLoadError('');
    try {
      const { data } = await api.get(`${ENDPOINT}?page=${p}&limit=20`);
      if (data && data.data && data.pagination) { if (!Array.isArray(data.data)) throw new Error('The native interpretation list returned an unexpected response.'); setItems(data.data); setPagination(data.pagination); }
      else { if (!Array.isArray(data)) throw new Error('The native interpretation list returned an unexpected response.'); setItems(data); setPagination(null); }
    } catch (e) { setLoadError(e.response?.data?.message || e.response?.data?.error || e.message || 'Could not load native interpretation sources.'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(page); }, [fetchItems, page]);

  const openNew = () => { setFormData({}); setEditing(null); setShowForm(true); };
  const openEdit = (item) => {
    const d = {}; FIELDS.forEach(f => { d[f.name] = item[f.name] ?? ''; });
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
      {loadError && <div role="alert">{loadError} <button type="button" className="btn btn-secondary" onClick={() => fetchItems(page)}>Retry native sources</button></div>}
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
      {showAI && <AIVerbsPanel item={aiTarget} rows={items} available={!loading && !loadError} unavailableReason={loadError} retry={() => fetchItems(page)} onClose={() => setShowAI(false)} />}
    </div>
  );
}
