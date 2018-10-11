const path = require('path');

module.exports = {
  client: 'sqlite3',
  directory: path.join(__dirname, '/migrations'),
  tableName: 'migrations',
  loadExtensions: ['.js']
};
