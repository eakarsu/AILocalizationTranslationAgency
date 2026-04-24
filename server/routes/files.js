const { createCrudRouter } = require('./helpers');
module.exports = createCrudRouter('translation_files', [
  'name', 'project_id', 'file_type', 'source_language', 'target_language',
  'word_count', 'status', 'file_path', 'notes'
]);
