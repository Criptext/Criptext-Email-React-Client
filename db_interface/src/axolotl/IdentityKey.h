#ifndef IDENTITYKEY_H_
#define IDENTITYKEY_H_

#include <sqlite_modern_cpp/sqlcipher.h>
#include <string>
#include <cstring>
#include "../dbUtils.h"

using namespace std;

namespace CriptextDB {

  struct IdentityKey { 
    string recipientId;
    long int deviceId;
    string identityKey;
  };

  IdentityKey getIdentityKey(string dbPath, string password, string recipientId, long int deviceId);
  bool createIdentityKey(string dbPath, string password, string recipientId, int deviceId, char *identityKey);
} 

#endif