import React, { useState } from 'react';
import api from '../services/api';
import AIResultView from '../pages/AIResultView';
import useCancelableAI from '../pages/useCancelableAI';

const supplied = value => value !== undefined && value !== null && (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'object' || String(value).trim() !== '');
const display = (value, field) => field.type === 'json' ? typeof value === 'string' ? value : JSON.stringify(value, null, 2) : field.type === 'boolean' ? value === '' ? '' : String(value) : value ?? '';
export default function InterpretationAIWorkspace({ title, endpoint, tools, item, rows = [], available, unavailableReason, retry, onClose }) {
  const [boundSource, setBoundSource] = useState(item || null);
  const [selectedVerb, setSelectedVerb] = useState(tools[0].verb), [values, setValues] = useState({}), request = useCancelableAI();
  const tool = tools.find(candidate => candidate.verb === selectedVerb) || tools[0];
  const sourceValue = field => supplied(boundSource?.[field.key]) ? boundSource[field.key] : field.key === 'log_id' && supplied(boundSource?.id) ? boundSource.id : undefined;
  const choicesFor = field => [...new Set(rows.map(row => field.key === 'log_id' ? row.log_id ?? row.id : row[field.key]).filter(supplied).map(String))];
  const fill = (scenario, selected = tool, current = values) => {
    const references = selected.fields.filter(field => field.reference);
    const matches = references.length ? rows.filter(row => references.every(field => supplied(field.key === 'log_id' ? row.log_id ?? row.id : row[field.key]))) : [];
    const source = boundSource || matches[scenario % (matches.length || 1)] || null;
    const reviewed = !boundSource && source ? {} : current;
    const next = {};
    for (const field of selected.fields) {
      const actual = supplied(source?.[field.key]) ? source[field.key] : field.key === 'log_id' && supplied(source?.id) ? source.id : undefined;
      if (supplied(actual)) next[field.key] = display(actual, field);
      else if (source || field.reference || field.verification) next[field.key] = supplied(reviewed[field.key]) ? reviewed[field.key] : '';
      else next[field.key] = display(field.samples[scenario], field);
    }
    if (source !== boundSource) setBoundSource(source);
    setValues(next); request.setResult(null); request.setError(null);
  };
  const missing = tool.fields.filter(field => (boundSource || field.reference || field.verification) && !supplied(sourceValue(field)) && !supplied(values[field.key]));
  const invalidSource = tool.fields.some(field => field.reference && supplied(values[field.key]) && !supplied(sourceValue(field)) && !choicesFor(field).includes(String(values[field.key])));
  const run = () => {
    if (!available || missing.length || invalidSource) return;
    request.run(async options => {
      const body = {};
      for (const field of tool.fields) {
        const actual = sourceValue(field), value = supplied(actual) ? actual : values[field.key];
        if (!supplied(value)) continue;
        body[field.key] = field.type === 'json' ? typeof value === 'string' ? JSON.parse(value) : value : field.type === 'number' ? Number(value) : field.type === 'boolean' ? value === true || value === 'true' : field.reference && field.key !== 'voice_id' ? Number(value) : value;
      }
      const response = await api.post(endpoint + '/ai/' + selectedVerb, body, options), result = response.data;
      if (result?.result?.stub || result?.result?.error || result?.error) throw new Error(result.result?.message || result.error || 'The native provider did not return an available result.');
      return result;
    });
  };
  const close = () => { request.cancel(); onClose(); };
  return <div className="modal-overlay" onClick={event => event.target === event.currentTarget && close()}><div className="modal" role="dialog" aria-modal="true" aria-label={'AI · ' + title} style={{ maxWidth: 900, width: 'min(900px, 94vw)', maxHeight: '90vh', overflowY: 'auto' }}>
    <button className="modal-close" type="button" aria-label="Cancel" onClick={close}>&times;</button><h2>AI · {title}</h2>
    <p>{boundSource ? 'Uses the selected saved record. Examples preserve its actual facts; missing source facts must be reviewed manually.' : 'Examples are fictional, unlinked draft inputs. They do not assert a recording, clinical fact, legal conclusion, compliance approval or completed action.'}</p>
    {boundSource && <button className="btn btn-secondary" type="button" disabled={request.loading} onClick={() => { setBoundSource(null); setValues({}); request.setResult(null); }}>Use an unlinked fictional draft</button>}
    <div className="form-group"><label htmlFor="interpretation-verb">AI feature</label><select id="interpretation-verb" value={selectedVerb} disabled={request.loading} onChange={event => { request.cancel(); const selected = tools.find(candidate => candidate.verb === event.target.value); setSelectedVerb(event.target.value); fill(0, selected, {}); }}>{tools.map(candidate => <option key={candidate.verb} value={candidate.verb}>{candidate.verb.replaceAll('-', ' ')}</option>)}</select></div>
    <section aria-label="Complete interpretation examples" style={{ padding: 16, border: '1px solid #64748b55', borderRadius: 10, marginBottom: 16 }}><strong>Fill every draft field</strong><p>All ordinary required and optional inputs are included. Actual references and verification evidence stay with their native source.</p><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{['Community review', 'Technical review', 'Quality review'].map((label, index) => <button type="button" key={label} className="btn btn-secondary" disabled={request.loading} onClick={() => fill(index)}>{label}</button>)}</div></section>
    {tool.fields.map(field => {
      const actual = sourceValue(field), readOnly = supplied(actual), value = readOnly ? display(actual, field) : values[field.key] ?? '', options = field.reference ? choicesFor(field) : field.options || [];
      return <div className="form-group" key={field.key}><label htmlFor={'interp-ai-' + field.key}>{field.label}{readOnly ? ' · saved source' : field.reference || field.verification ? ' · actual source required' : ' · draft input'}</label>
        {field.reference || field.type === 'boolean' || field.type === 'select' ? <select id={'interp-ai-' + field.key} data-native-ai-field={field.key} value={value} disabled={readOnly || request.loading} onChange={event => { if (field.reference) { const source = rows.find(row => String(field.key === 'log_id' ? row.log_id ?? row.id : row[field.key]) === event.target.value); if (source) { request.cancel(); setBoundSource(source); setValues({}); request.setResult(null); return; } } setValues({ ...values, [field.key]: event.target.value }); }}><option value="">{field.reference ? 'Choose an actual loaded reference' : 'Not supplied'}</option>{[...new Set([...(field.type === 'boolean' ? ['false', 'true'] : options), ...(readOnly ? [String(value)] : [])])].map(option => <option key={option} value={option}>{option}</option>)}</select>
          : field.type === 'textarea' || field.type === 'json' ? <textarea id={'interp-ai-' + field.key} data-native-ai-field={field.key} rows={4} value={value} readOnly={readOnly} disabled={request.loading} onChange={event => setValues({ ...values, [field.key]: event.target.value })} />
          : <input id={'interp-ai-' + field.key} data-native-ai-field={field.key} type={field.type === 'number' ? 'number' : 'text'} min={field.min} step={field.step} value={value} readOnly={readOnly} disabled={request.loading} onChange={event => setValues({ ...values, [field.key]: event.target.value })} />}
      </div>;
    })}
    {missing.length > 0 && <p role="status">Supply actual source values for {missing.map(field => field.label).join(', ')}. Examples cannot invent these values.</p>}
    {invalidSource && <p role="status">The selected reference is no longer in the permitted native list. Reload sources before generating.</p>}
    {!available && <div role="status">{unavailableReason || 'The native provider route is unavailable. Its evaluation and production gates remain in force.'} {retry && <button type="button" className="btn btn-secondary" onClick={retry}>Retry native availability</button>}</div>}
    <div className="modal-actions"><button type="button" className="btn btn-primary" disabled={!available || request.loading || missing.length > 0 || invalidSource} onClick={run}>{request.loading ? 'Preparing report…' : 'Generate with OpenRouter'}</button><button type="button" className="btn btn-secondary" onClick={request.loading ? request.cancel : close}>Cancel</button></div>
    {request.error && <p role="alert">{request.error}</p>}{request.notice && <p role="status">{request.notice}</p>}{request.result && <AIResultView result={request.result.result || request.result} title={title + ' · draft review'} />}
  </div></div>;
}
