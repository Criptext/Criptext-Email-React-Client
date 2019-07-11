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

bool CriptextDB::createIdentityKey(string dbPath, string recipientId, int deviceId, char *identityKey, int accountId) {
  std::cout << "Create Identity Key : " << recipientId << std::endl;

  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    SQLite::Transaction transaction(db);

    SQLite::Statement getQuery(db, "Select * from identitykeyrecord where recipientId == ? and deviceId == ? and accountId == ?");
    getQuery.bind(1, recipientId);
    getQuery.bind(2, deviceId);
    getQuery.bind(3, accountId);

    getQuery.executeStep();

    if (getQuery.hasRow()) {
      int rowId = getQuery.getColumn(0).getInt();
      SQLite::Statement query(db, "update identitykeyrecord set identityKey = ? where id == ?");
      query.bind(1, identityKey);
      query.bind(2, rowId);
      query.exec();
    } else {
      SQLite::Statement query(db, "insert into identitykeyrecord (recipientId, deviceId, identityKey, accountId) values (?,?,?,?)");
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, identityKey);
      query.bind(4, accountId);
      query.exec();
    }

    transaction.commit();
  } catch (exception& e) {
    std::cout << "gg" <<  e.what() << std::endl;
    return false;
  }
  std::cout << "yeah" << std::endl;
  return true;
}