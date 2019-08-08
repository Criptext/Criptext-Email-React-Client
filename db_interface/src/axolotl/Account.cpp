#include "Account.h"
#include <iostream>

using namespace std;

CriptextDB::Account CriptextDB::getAccount(string dbPath, char *recipientId) {
  SQLite::Database db(dbPath);
  db.setBusyTimeout(5000);
  SQLite::Statement query(db, "select * from account where recipientId == ?");
  query.bind(1, recipientId);
  query.executeStep();

  char *privKey = strdup(query.getColumn(6).getText());
  char *pubKey = strdup(query.getColumn(7).getText());
  Account account = { privKey, pubKey, query.getColumn(5).getInt() };

  while(query.hasRow()) {
    query.executeStep();
  }

  return account;
}

int CriptextDB::createAccount(string dbPath, char* recipientId, char* name, int deviceId, char* pubKey, char* privKey, int registrationId) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    db.setBusyTimeout(5000);
    SQLite::Statement getQuery(db, "Select * from account where recipientId == ?");
    getQuery.bind(1, recipientId);
    getQuery.executeStep();

    if (getQuery.hasRow()) {
      while(getQuery.hasRow()) {
        getQuery.executeStep();
      }
      SQLite::Statement query(db, "update account set name = ?, deviceId = ?, privKey = ?, pubKey = ?, registrationId = ? where recipientId == ?");
      query.bind(1, name);
      query.bind(2, deviceId);
      query.bind(3, privKey);
      query.bind(4, pubKey);
      query.bind(5, registrationId);
      query.bind(6, recipientId);

      query.exec();
    } else {
      SQLite::Statement query(db, "insert into account (recipientId, name, deviceId, jwt, refreshToken, privKey, pubKey, registrationId) values (?,?,?,?,?,?,?,?)");
      query.bind(1, recipientId);
      query.bind(2, name);
      query.bind(3, deviceId);
      query.bind(4, "");
      query.bind(5, "");
      query.bind(6, privKey);
      query.bind(7, pubKey);
      query.bind(8, registrationId);

      query.exec();
    }

    return 0;

  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return -1;
  }
}
