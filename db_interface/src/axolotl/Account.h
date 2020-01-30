#ifndef ACCOUNT_H_
#define ACCOUNT_H_

#include <sqlite_modern_cpp/sqlcipher.h>
#include <sqlite_modern_cpp.h>
#include <cstring>
#include <string>
#include <memory>
#include <vector>
#include <iostream>
#include "../dbUtils.h"

using namespace std;

namespace CriptextDB {
  struct Account {
    int id;
    string privKey;
    string pubKey;
    int registrationId;
    connection_type con;
    database getDB() {
      return database(con);
    }
  };

  Account getAccount(database db, char* recipientId);
  int createAccount(database db, char* recipientId, char* name, int deviceId, char* pubKey, char* privKey, int registrationId);
} 

#endif