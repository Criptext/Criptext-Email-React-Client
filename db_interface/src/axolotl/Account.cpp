#include "Account.h"
#include <iostream>

using namespace std;

CriptextDB::Account CriptextDB::getAccount(string dbPath, int accountId) {
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "select * from account where id == ?");
  query.bind(1, accountId);

  query.executeStep();

  Account account = { query.getColumn(0).getInt(), query.getColumn(6).getString(), query.getColumn(7).getString(), query.getColumn(8).getInt() };
  return account;
}

int CriptextDB::createAccount(string dbPath, char* recipientId, char* name, int deviceId, char* pubKey, char* privKey, int registrationId) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

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
    return 0;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return -1;
  }
}
