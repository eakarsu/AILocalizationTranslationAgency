const { createCrudRouter } = require('./helpers');
module.exports = createCrudRouter('language_pairs', [
  'source_language', 'target_language', 'rate_per_word', 'avg_delivery_days',
  'available_translators', 'status', 'quality_tier'
]);
