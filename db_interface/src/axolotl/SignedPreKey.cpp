#include "SignedPreKey.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>
#include <iostream>

using namespace std;

CriptextDB::SignedPreKey CriptextDB::getSignedPreKey(string dbPath, short int id, int accountId) {
  std::cout << "Get SignedPreKey : " << id << " : " <<  dbPath << " : " << accountId << std::endl;
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "Select * from signedprekeyrecord where signedPreKeyId == ? and accountId == ?");
  query.bind(1, id);
  query.bind(2, accountId);

  query.executeStep();

  CriptextDB::SignedPreKey signedPreKey = { query.getColumn(1).getInt(), query.getColumn(2).getString(), query.getColumn(3).getString() };
  return signedPreKey;
}

bool CriptextDB::createSignedPreKey(string dbPath, short int id, char *keyRecord, int accountId) {
  std::cout << "Create SignedPreKey : " << id << std::endl;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "insert into signedprekeyrecord (signedPreKeyId, signedPreKeyPrivKey, signedPreKeyPubKey, accountId) values (?,?,?,?)");
    query.bind(1, id);
    query.bind(2, keyRecord);
    query.bind(3, "");
    query.bind(4, accountId);

    query.exec();
  } catch (exception& e) {
    return false;
  }

  return true;
}

bool CriptextDB::deleteSignedPreKey(string dbPath, short int id, int accountId) {
  std::cout << "Delete SignedPreKey : " << id << std::endl;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "delete from signedPrekeyrecord where signedPreKeyId == ? and accountId == ?");
    query.bind(1, id);
    query.bind(2, accountId);

    query.exec();
  } catch (exception& e) {
    return false;
  }

  return true;
}