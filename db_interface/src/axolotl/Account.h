#ifndef ACCOUNT_H_
#define ACCOUNT_H_

#include <sqlite_modern_cpp/sqlcipher.h>
#include <sqlite_modern_cpp.h>
#include <cstring>
#include <string>
#include <memory>
#include <vector>
#include "../dbUtils.h"

using namespace std;

namespace CriptextDB {
  struct Account {
    string privKey;
    string pubKey;
    int registrationId;
    string dbPath;
    string password;
  };

  Account getAccount(string dbPath, string password, char* recipientId);
  int createAccount(string dbPath, string password, char* recipientId, char* name, int deviceId, char* pubKey, char* privKey, int registrationId);
} 

#endif