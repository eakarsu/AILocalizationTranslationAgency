import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
export default function TerminologyDriftQa() {
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(false), active = useRef(null);
  const load = async () => {
    active.current?.abort(); const controller = new AbortController(); active.current = controller; setLoading(true); setError('');
    try {
      const response = await api.get('/terminology-drift-qa', { signal: controller.signal });
      if (!Array.isArray(response.data?.terms) || response.data.terms.some(term => !term || typeof term.term !== 'string')) throw new Error('The native terminology comparison returned an unexpected response.');
      if (!controller.signal.aborted && active.current === controller) setData(response.data);
    } catch (failure) { if (!controller.signal.aborted && active.current === controller) setError(failure.response?.data?.error || failure.message || 'Could not load native terminology examples.'); }
    finally { if (active.current === controller) { active.current = null; setLoading(false); } }
  };
  useEffect(() => { load(); return () => active.current?.abort(); }, []);
  return <div><h1>Terminology Drift QA</h1><p>Deterministic terminology comparison using the native illustrative examples. These are sample terms, not saved or approved client glossary evidence.</p>{loading && <p role="status">Loading native examples…</p>}{error && <div role="alert">{error} <button type="button" className="btn btn-secondary" onClick={load}>Retry native comparison</button></div>}{!loading && !error && data?.terms.map(term => <section className="card" key={term.term}><h2>{term.term}</h2><p>{term.drift ? 'Needs terminology review' : 'Matches the example reference'}: {term.observed}</p><p>Example reference: {term.approved}. Sample occurrences: {term.occurrences}.</p></section>)}</div>;
}
