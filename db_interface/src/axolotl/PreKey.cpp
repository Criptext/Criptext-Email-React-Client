#include "PreKey.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <iostream>

using namespace std;

CriptextDB::PreKey CriptextDB::getPreKey(string dbPath, short int id, int accountId) {
  std::cout << "Get PreKey : " << id << std::endl;
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "Select * from prekeyrecord where preKeyId == ? and accountId == ?");
  query.bind(1, id);
  query.bind(2, accountId);

  query.executeStep();
  CriptextDB::PreKey preKey = { query.getColumn(1).getInt(), query.getColumn(2).getString(), query.getColumn(3).getString() };
  return preKey;
}

bool CriptextDB::createPreKey(string dbPath, short int id, string privKey, string pubKey, int accountId) {
  std::cout << "Create PreKey : " << id << std::endl;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "insert into prekey (preKeyId, preKeyPrivKey, preKeyPubKey, accountId) values (?,?,?,?)");
    query.bind(1, id);
    query.bind(2, privKey);
    query.bind(3, pubKey);
    query.bind(4, accountId);

    query.exec();
    return true;
  } catch (exception& e) {
    return false;
  }
}

bool CriptextDB::deletePreKey(string dbPath, short int id, int accountId) {
  std::cout << "Delete PreKey : " << id << std::endl;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "delete from prekeyrecord where preKeyId == ? and accountId == ?");
    query.bind(1, id);
    query.bind(2, accountId);

    query.exec();
    return true;
  } catch (exception& e) {
    return false;
  }
}
