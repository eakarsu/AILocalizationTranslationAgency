const { createCrudRouter } = require('./helpers');
module.exports = createCrudRouter('projects', [
  'name', 'description', 'client_id', 'source_language', 'target_languages',
  'status', 'deadline', 'budget', 'word_count', 'project_type'
]);
