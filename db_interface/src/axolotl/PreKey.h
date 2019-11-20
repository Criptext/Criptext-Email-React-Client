#ifndef PREKEY_H_
#define PREKEY_H_

#include <string>
#include <cstring>
#include <sqlite_modern_cpp.h>
#include <iostream>

using namespace std;

namespace CriptextDB {

  struct PreKey { 
    int id;
    string record;
    size_t len;
  };

  PreKey getPreKey(string dbPath, short int id);
  bool createPreKey(string dbPath, short int id, char *keyRecord, size_t len);
  bool deletePreKey(string dbPath, short int id);

} 

#endif