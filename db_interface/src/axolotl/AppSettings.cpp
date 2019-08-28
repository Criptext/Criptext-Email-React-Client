#include "AppSettings.h"
#include <iostream>

using namespace std;

CriptextDB::AppSettings CriptextDB::getSettings(string dbPath, char *recipientId) {
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "select * from account where recipientId == ?");
  query.bind(1, recipientId);

  query.executeStep();

  char *privKey = strdup(query.getColumn(6).getText());
  char *pubKey = strdup(query.getColumn(7).getText());
  AppSettings account = { privKey, pubKey, query.getColumn(5).getInt() };
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

int CriptextDB::updateAccount(string dbPath, char* recipientId, char* jwt, char* name, char* signature, bool signatureEnabled) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "update account set jwt = ?, name = ?, signature = ?, signsignatureEnabled = ? where recipientId == ?");
    query.bind(1, jwt);
    query.bind(2, name);
    query.bind(3, signature);
    query.bind(4, signatureEnabled);
    query.bind(5, recipientId);

    return query.exec();
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return -1;
  }
}
