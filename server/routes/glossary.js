const { createCrudRouter } = require('./helpers');
module.exports = createCrudRouter('glossary', [
  'term', 'definition', 'source_language', 'target_language', 'translation',
  'domain', 'context', 'approved', 'notes'
]);
