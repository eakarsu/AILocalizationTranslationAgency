const { createCrudRouter } = require('./helpers');
module.exports = createCrudRouter('clients', [
  'name', 'email', 'company', 'phone', 'country', 'industry', 'notes', 'status'
]);
