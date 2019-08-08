#include "PreKey.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <iostream>

using namespace std;

CriptextDB::PreKey CriptextDB::getPreKey(string dbPath, short int id) {
  SQLite::Database db(dbPath);
  db.setBusyTimeout(5000);
  SQLite::Statement query(db, "Select * from prekeyrecord where preKeyId == ?");
  query.bind(1, id);
  query.executeStep();
  char *record = strdup(query.getColumn(1).getText());
  CriptextDB::PreKey preKey = { query.getColumn(0).getInt(), record, (size_t)query.getColumn(2).getInt() };
  
  while(query.hasRow()) {
    query.executeStep();
  }
  return preKey;
}

bool CriptextDB::createPreKey(string dbPath, short int id, char *keyRecord, size_t len) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    db.setBusyTimeout(5000);
    SQLite::Statement query(db, "insert into prekeyrecord (preKeyId, record, recordLength) values (?,?,?)");
    query.bind(1, id);
    query.bind(2, keyRecord);
    query.bind(3, static_cast<int>(len));

    query.exec();
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}

bool CriptextDB::deletePreKey(string dbPath, short int id) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    db.setBusyTimeout(5000);
    SQLite::Statement query(db, "delete from prekeyrecord where preKeyId == ?");
    query.bind(1, id);

    query.exec();
    return true;
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }
}
