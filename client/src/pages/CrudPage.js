import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function CrudPage({ title, endpoint, fields }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`${endpoint}?page=${p}&limit=20`);
      // Handle both paginated { data, pagination } and legacy array responses
      if (data && data.data && data.pagination) {
        setItems(data.data);
        setPagination(data.pagination);
      } else {
        setItems(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [endpoint]);

  useEffect(() => { fetchItems(page); }, [fetchItems, page]);

  const openNew = () => {
    setFormData({});
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    const data = {};
    fields.forEach(f => {
      let val = item[f.name];
      if (f.type === 'date' && val) val = val.substring(0, 10);
      data[f.name] = val || '';
    });
    setFormData(data);
    setEditing(item);
    setShowForm(true);
    setSelected(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      setShowForm(false);
      fetchItems(page);
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      setSelected(null);
      fetchItems(page);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting');
    }
  };

  const displayCols = fields.slice(0, 6);

  const formatValue = (val, field) => {
    if (val === null || val === undefined) return '-';
    if (field.type === 'date' && val) return new Date(val).toLocaleDateString();
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  };

  return (
    <div>
      <div className="page-header">
        <h1>{title}</h1>
        <button className="btn btn-primary" style={{width: 'auto'}} onClick={openNew}>+ New {title.replace(/s$/, '')}</button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div> Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  {displayCols.map(f => <th key={f.name}>{f.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td>{item.id}</td>
                    {displayCols.map(f => (
                      <td key={f.name}>
                        {(f.name === 'status' || f.name === 'priority') ? (
                          <span className={`status-badge status-${item[f.name]}`}>{item[f.name]}</span>
                        ) : formatValue(item[f.name], f)}
                      </td>
                    ))}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={displayCols.length + 1} style={{textAlign: 'center', padding: 40, color: '#64748b'}}>No items found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '16px 0' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { const p = page - 1; setPage(p); fetchItems(p); }}
            disabled={page <= 1}
          >
            &larr; Prev
          </button>
          <span style={{ color: '#64748b', fontSize: 14 }}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { const p = page + 1; setPage(p); fetchItems(p); }}
            disabled={page >= pagination.totalPages}
          >
            Next &rarr;
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
            <h2>{title.replace(/s$/, '')} Details</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">ID</div>
                <div className="detail-value">{selected.id}</div>
              </div>
              {fields.map(f => (
                <div key={f.name} className={`detail-item ${f.type === 'textarea' ? 'full-width' : ''}`}>
                  <div className="detail-label">{f.label}</div>
                  <div className="detail-value">
                    {(f.name === 'status' || f.name === 'priority') ? (
                      <span className={`status-badge status-${selected[f.name]}`}>{selected[f.name] || '-'}</span>
                    ) : formatValue(selected[f.name], f)}
                  </div>
                </div>
              ))}
              {selected.created_at && (
                <div className="detail-item">
                  <div className="detail-label">Created</div>
                  <div className="detail-value">{new Date(selected.created_at).toLocaleString()}</div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(selected)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            <h2>{editing ? 'Edit' : 'New'} {title.replace(/s$/, '')}</h2>
            <form onSubmit={handleSubmit}>
              {fields.map(f => (
                <div key={f.name} className="form-group">
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})}>
                      <option value="">Select...</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : f.type}
                      step={f.type === 'number' ? 'any' : undefined}
                      value={formData[f.name] || ''}
                      onChange={e => setFormData({...formData, [f.name]: e.target.value})}
                      required={f.required}
                    />
                  )}
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{width: 'auto'}}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
