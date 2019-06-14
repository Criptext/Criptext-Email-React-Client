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

  CriptextDB::SignedPreKey signedPreKey = { query.getColumn(2).getInt(), query.getColumn(3).getString(), query.getColumn(4).getString() };
  return signedPreKey;
}

bool CriptextDB::createSignedPreKey(string dbPath, short int id, string privKey, string pubKey, int accountId) {
  std::cout << "Create SignedPreKey : " << id << std::endl;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "insert into signedprekey (signedPreKeyId, signedPreKeyPrivKey, signedPreKeyPubKey, accountId) values (?,?,?,?)");
    query.bind(1, id);
    query.bind(2, privKey);
    query.bind(3, pubKey);
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
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "delete from signedPrekeyrecord where signedPreKeyId == ? and accountId == ?");
    query.bind(1, id);
    query.bind(2, accountId);

    query.exec();
  } catch (exception& e) {
    return false;
  }

  return true;
}