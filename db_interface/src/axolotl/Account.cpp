#include "Account.h"
#include <iostream>

using namespace std;
using namespace sqlite;

CriptextDB::Account CriptextDB::getAccount(string dbPath, char *recipientId) {
  sqlite_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
  database db(dbPath, config);
  
  char *myPrivKey;
  char *myPubKey;
  int regId = 0;
  db << "select privKey, pubKey, registrationId from account where recipientId == ?;"
    << recipientId
    >> [&] (string privKey, string pubKey, int registrationId) {
      myPrivKey = (char *)malloc(privKey.length());
      myPubKey = (char *)malloc(pubKey.length());
      strcpy(myPrivKey, privKey.c_str());
      strcpy(myPubKey, pubKey.c_str());
      regId = registrationId;
  };
  Account account = { 
    .privKey = myPrivKey, 
    .pubKey = myPubKey, 
    .registrationId = regId 
  };
  return account;
}

int CriptextDB::createAccount(string dbPath, char* recipientId, char* name, int deviceId, char* pubKey, char* privKey, int registrationId) {
  try {
    bool hasRow;
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    database db(dbPath, config);
    db << "begin;";
    db << "Select recipientId from account where recipientId == ?;"
     << recipientId
     >> [&] (string recipientId) {
        hasRow = true;
    };

    if (hasRow) {
      db << "update account set name = ?, deviceId = ?, privKey = ?, pubKey = ?, registrationId = ? where recipientId == ?;"
        << name
        << deviceId
        << privKey
        << pubKey
        << registrationId
        << recipientId;
    } else {
      db << "insert into account (recipientId, name, deviceId, jwt, refreshToken, privKey, pubKey, registrationId) values (?,?,?,?,?,?,?,?);"
        << recipientId
        << name
        << deviceId
        << ""
        << ""
        << privKey
        << pubKey
        << registrationId;
    }
    db << "commit;";
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }
  return true;
}
