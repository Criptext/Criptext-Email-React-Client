#include "IdentityKey.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <iostream>

using namespace std;

CriptextDB::IdentityKey CriptextDB::getIdentityKey(string dbPath, string recipientId, long int deviceId, int accountId) {
  std::cout << "Get Identity Key : " << recipientId << std::endl;

  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "Select * from identitykeyrecord where recipientId == ? and deviceId == ? and accountId == ?");
  query.bind(1, recipientId);
  query.bind(2, deviceId);
  query.bind(3, accountId);

  query.executeStep();

  CriptextDB::IdentityKey identityKey = { query.getColumn(1).getString(), query.getColumn(2).getInt(), query.getColumn(3).getString() };
  return identityKey;
}

bool CriptextDB::createIdentityKey(string dbPath, string recipientId, int deviceId, string identityKey, int accountId) {
  std::cout << "Create Identity Key : " << recipientId << std::endl;

  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "insert into identitykeyrecord (recipientId, deviceId, identityKey, accountId) values (?,?,?,?)");
    query.bind(1, recipientId);
    query.bind(2, deviceId);
    query.bind(3, identityKey);
    query.bind(4, accountId);

    query.exec();
  } catch (exception& e) {
    return false;
  }

  return true;
}