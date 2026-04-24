const { createCrudRouter } = require('./helpers');
module.exports = createCrudRouter('orders', [
  'project_id', 'client_id', 'translator_id', 'source_language', 'target_language',
  'word_count', 'status', 'priority', 'deadline', 'total_cost', 'notes'
]);
