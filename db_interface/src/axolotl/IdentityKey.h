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

  IdentityKey getIdentityKey(database db, int accountId, string recipientId, long int deviceId);
  bool createIdentityKey(database db, int accountId, string recipientId, int deviceId, char *identityKey);
} 

#endif