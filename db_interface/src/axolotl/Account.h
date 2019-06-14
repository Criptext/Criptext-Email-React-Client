#ifndef ACCOUNT_H_
#define ACCOUNT_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct Account {
    int id;
    string privKey;
    string pubKey;
    int registrationId;
  };

  Account getAccount(string dbPath, int accountId);
} 

#endif