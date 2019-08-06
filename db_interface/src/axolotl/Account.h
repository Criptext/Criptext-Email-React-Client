#ifndef ACCOUNT_H_
#define ACCOUNT_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct Account {
    char* privKey;
    char* pubKey;
    int registrationId;
    char* dbPath;
  };

  Account getAccount(string dbPath, char* recipientId);
  int createAccount(string dbPath, char* recipientId, char* name, int deviceId, char* pubKey, char* privKey, int registrationId);
} 

#endif