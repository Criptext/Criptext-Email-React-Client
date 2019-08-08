#include "SignedPreKey.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>
#include <iostream>
#include <sstream>

using namespace std;

CriptextDB::SignedPreKey CriptextDB::getSignedPreKey(string dbPath, short int id) {
  SQLite::Database db(dbPath);
  db.setBusyTimeout(5000);
  SQLite::Statement query(db, "Select * from signedprekeyrecord where signedPreKeyId == ?");
  query.bind(1, id);

  query.executeStep();
  char *record = strdup(query.getColumn(1).getText());
  CriptextDB::SignedPreKey signedPreKey = { query.getColumn(0).getInt(), record, query.getColumn(2).getInt() };
  
  while(query.hasRow()) {
    query.executeStep();
  }
  return signedPreKey;
}

bool CriptextDB::createSignedPreKey(string dbPath, short int id, char *keyRecord, size_t len) {
  std::cout << "Create SignedPreKey : " << id << std::endl;

  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    db.setBusyTimeout(5000);
    SQLite::Statement query(db, "insert into signedprekeyrecord (signedPreKeyId, record, recordLength) values (?,?,?)");
    query.bind(1, id);
    query.bind(2, keyRecord);
    query.bind(3, static_cast<int>(len));

    query.exec();
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }

  return true;
}

bool CriptextDB::deleteSignedPreKey(string dbPath, short int id) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    db.setBusyTimeout(5000);
    SQLite::Statement query(db, "delete from signedPrekeyrecord where signedPreKeyId == ?");
    query.bind(1, id);

    query.exec();
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }

  return true;
}