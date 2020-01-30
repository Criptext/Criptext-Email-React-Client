#ifndef PREKEY_H_
#define PREKEY_H_

#include <string>
#include <cstring>
#include <sqlite_modern_cpp/sqlcipher.h>
#include <iostream>
#include "../dbUtils.h"

using namespace std;

namespace CriptextDB {

  struct PreKey { 
    int id;
    string record;
    size_t len;
  };

  PreKey getPreKey(database db, int accountId, short int id);
  bool createPreKey(database db, int accountId, short int id, char *keyRecord, size_t len);
  bool deletePreKey(database db, int accountId, short int id);

} 

#endif