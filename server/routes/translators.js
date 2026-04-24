const { createCrudRouter } = require('./helpers');
module.exports = createCrudRouter('translators', [
  'name', 'email', 'languages', 'specializations', 'rate_per_word',
  'rating', 'status', 'country', 'experience_years', 'certifications'
]);
