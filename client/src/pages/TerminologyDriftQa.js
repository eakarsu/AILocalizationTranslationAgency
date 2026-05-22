import React, { useEffect, useState } from 'react';
export default function TerminologyDriftQa() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch('/api/terminology-drift-qa').then(r => r.json()).then(setData).catch(() => {}); }, []);
  return <div><h1>Terminology Drift QA</h1><p>Flags translated terms that diverge from approved glossary language.</p>{data?.terms?.map(t => <section className="card" key={t.term}><h2>{t.term}</h2><p>{t.action}: {t.observed}</p></section>)}</div>;
}
