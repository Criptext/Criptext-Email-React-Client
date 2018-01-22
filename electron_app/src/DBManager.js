const db = require('./models.js');

module.exports.getRow = function(table, where){
  const specs = buildSelectQuerySpecs(where);
  const sql = `SELECT * FROM ${table} WHERE ${specs.whereKey.join(' AND ')}`;

  return new Promise( (resolve, reject) => {
    db.all(sql, specs.whereValue, (err, rows) => {
      if(err){
        reject(err);
      }
      resolve(rows);
    })
  }) 
}

module.exports.insertRow = function(table, params){
  const specs = buildInsertQuerySpecs(params);
  const sql = `INSERT INTO ${table}(${specs.insertKeys.join(',')}) values(${specs.insertSpaces.join(',')})`;
  return new Promise( (resolve, reject) => {
    db.all(sql, specs.insertValues, (err) => {
      if(err){
        reject(err);
      }
      resolve();
    })
  }) 
}

module.exports.updateRows = function(table, params, where){
  const specs = buildUpdateQuerySpecs(params, where);
  const sql = `UPDATE ${table} SET ${specs.updateKey.join(', ')} 
    WHERE ${specs.whereKey.join(' AND ')}`;
  return new Promise( (resolve, reject) => {
    db.all(sql, specs.updateValue.concat(specs.whereValue), (err) => {
      if(err){
        reject(err);
      }
      resolve();
    })
  }) 
}

module.exports.closeDB = function(){
  db.close();
}

const buildSelectQuerySpecs = function(where){
  const whereKey = [];
  const whereValue = [];
  Object.keys(where).forEach( key => {
    whereKey.push(`${key}=?`);
    whereValue.push(where[key]);
  })
  return {
    whereKey,
    whereValue
  }
}

const buildUpdateQuerySpecs = function(params, where){
  const updateKey = [];
  const whereKey = [];
  const updateValue = [];
  const whereValue = [];
  Object.keys(params).forEach( key => {
    updateKey.push(`${key}=?`);
    updateValue.push(params[key]);
  });
  Object.keys(where).forEach( key => {
    whereKey.push(`${key}=?`);
    whereValue.push(where[key]);
  })
  return {
    updateKey,
    whereKey,
    updateValue,
    whereValue
  }
}

const buildInsertQuerySpecs = function(params){
  const insertKeys = [];
  const insertSpaces = [];
  const insertValues = [];
  Object.keys(params).forEach( key => {
    insertKeys.push(key);
    insertSpaces.push('?');
    insertValues.push(params[key]);
  })
  return {
    insertKeys,
    insertSpaces,
    insertValues
  }
}