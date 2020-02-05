const { existsDatabase } = require('./../utils/dataBaseUtils');
const hasNormalDatabase = existsDatabase('Criptext.db');
const dbManager = hasNormalDatabase
  ? require('../database/DBManager')
  : require('../database/DBEmanager');
module.exports = dbManager;
