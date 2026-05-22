const express = require('express');
const router = express.Router();
function qa(input = {}) {
  const terms = input.terms || [
    { term: 'chargeback', approved: 'retroceso de cargo', observed: 'devolucion', occurrences: 14 },
    { term: 'checkout', approved: 'pago', observed: 'pago', occurrences: 31 },
  ];
  return { terms: terms.map(t => ({ ...t, drift: t.approved !== t.observed, action: t.approved !== t.observed ? 'terminology_review' : 'approved' })) };
}
router.get('/', (req, res) => res.json(qa()));
router.post('/qa', (req, res) => res.json(qa(req.body || {})));
module.exports = router;
