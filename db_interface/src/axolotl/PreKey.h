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

  PreKey getPreKey(string dbPath, string password, short int id);
  bool createPreKey(string dbPath, string password, short int id, char *keyRecord, size_t len);
  bool deletePreKey(string dbPath, string password, short int id);

} 

#endif