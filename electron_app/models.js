const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydb.db');

db.serialize( () => {
  db.run('CREATE TABLE IF NOT EXISTS user(' + 
    'email text PRIMARY KEY, ' + 
    'name text, ' + 
    'nickname text' + 
  ')');
  db.run('CREATE TABLE IF NOT EXISTS label(' +
    'id integer PRIMARY KEY AUTOINCREMENT, ' + 
    'text text, ' + 
    'color text' + 
  ')');
  db.run('CREATE TABLE IF NOT EXISTS email(' + 
    'key text PRIMARY KEY, ' + 
    'threadId text, ' +  
    's3Key text, ' + 
    'unread integer, ' + 
    'secure integer, ' + 
    'content text, ' + 
    'preview text, ' + 
    'subject text, ' + 
    'delivered integer, ' + 
    'isTrash integer, ' +
    'isDraft integer' + 
  ')');
  db.run('CREATE TABLE IF NOT EXISTS label_email(' + 
    'id integer PRIMARY KEY AUTOINCREMENT, ' + 
    'labelId integer, ' +  
    'emailId text, ' +
    'FOREIGN KEY (labelId) REFERENCES label(id), ' + 
    'FOREIGN KEY (emailId) REFERENCES email(key)' + 
  ')');
  db.run('CREATE TABLE IF NOT EXISTS email_user(' + 
    'id integer PRIMARY KEY AUTOINCREMENT, ' + 
    'userId text, ' + 
    'emailId text, ' +  
    'type text, '+
    'FOREIGN KEY (userId) REFERENCES label(email), ' + 
    'FOREIGN KEY (emailId) REFERENCES email(key)' + 
  ')');
})

module.exports = db;