const { createCrudRouter } = require('./helpers');
module.exports = createCrudRouter('invoices', [
  'invoice_number', 'client_id', 'order_id', 'amount', 'tax', 'total',
  'status', 'due_date', 'paid_date', 'notes'
]);
