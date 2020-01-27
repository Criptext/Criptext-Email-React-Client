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

  PreKey getPreKey(database db, string password, short int id);
  bool createPreKey(database db, string password, short int id, char *keyRecord, size_t len);
  bool deletePreKey(database db, string password, short int id);

} 

#endif