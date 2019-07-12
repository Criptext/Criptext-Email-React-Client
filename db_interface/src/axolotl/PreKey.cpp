#include "PreKey.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <iostream>

using namespace std;

CriptextDB::PreKey CriptextDB::getPreKey(string dbPath, short int id) {
  std::cout << "Get PreKey : " << id << std::endl;
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "Select * from prekeyrecord where preKeyId == ?");
  query.bind(1, id);

  query.executeStep();
  CriptextDB::PreKey preKey = { query.getColumn(0).getInt(), query.getColumn(1).getString(), query.getColumn(2).getString() };
  return preKey;
}

bool CriptextDB::createPreKey(string dbPath, short int id, char *keyRecord) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "insert into prekeyrecord (preKeyId, preKeyPrivKey, preKeyPubKey) values (?,?,?)");
    query.bind(1, id);
    query.bind(2, keyRecord);
    query.bind(3, "");

    query.exec();
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}

bool CriptextDB::deletePreKey(string dbPath, short int id) {
  std::cout << "Delete PreKey : " << id << std::endl;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "delete from prekeyrecord where preKeyId == ?");
    query.bind(1, id);

    query.exec();
    return true;
  } catch (exception& e) {
    return false;
  }
}
