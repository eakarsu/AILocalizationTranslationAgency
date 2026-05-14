import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function AIHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [expanded, setExpanded] = useState({});

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/ai-results?page=${p}&limit=20`);
      if (data && data.data) {
        setItems(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchHistory(page); }, [fetchHistory, page]);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const endpointColor = (endpoint) => {
    const colors = {
      translate: '#6366f1', localize: '#8b5cf6', grammar: '#ec4899',
      quality: '#f59e0b', cultural: '#10b981', 'translator-matcher': '#3b82f6',
      'generate-quote': '#f97316',
    };
    return colors[endpoint] || '#64748b';
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Call History</h1>
        <span style={{ color: '#64748b', fontSize: 14 }}>Your past AI requests</span>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div> Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
          <h3>No AI calls yet</h3>
          <p>Use any AI feature to see your history here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
              overflow: 'hidden'
            }}>
              <div
                style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', gap: 12 }}
                onClick={() => toggleExpand(item.id)}
              >
                <span style={{
                  background: endpointColor(item.endpoint), color: '#fff',
                  padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600
                }}>
                  {item.endpoint}
                </span>
                <span style={{ color: '#94a3b8', fontSize: 13, flex: 1 }}>
                  {new Date(item.created_at).toLocaleString()}
                </span>
                <span style={{ color: '#64748b', fontSize: 18 }}>
                  {expanded[item.id] ? '▲' : '▼'}
                </span>
              </div>

              {expanded[item.id] && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #334155' }}>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>INPUT</div>
                    <pre style={{
                      background: '#0f172a', padding: 12, borderRadius: 6, fontSize: 12,
                      color: '#e2e8f0', overflow: 'auto', maxHeight: 200,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                    }}>
                      {JSON.stringify(item.input_data, null, 2)}
                    </pre>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>RESULT</div>
                    <pre style={{
                      background: '#0f172a', padding: 12, borderRadius: 6, fontSize: 12,
                      color: '#4ade80', overflow: 'auto', maxHeight: 300,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                    }}>
                      {JSON.stringify(item.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '24px 0' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { const p = page - 1; setPage(p); fetchHistory(p); }}
            disabled={page <= 1}
          >
            &larr; Prev
          </button>
          <span style={{ color: '#64748b', fontSize: 14 }}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { const p = page + 1; setPage(p); fetchHistory(p); }}
            disabled={page >= pagination.totalPages}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
