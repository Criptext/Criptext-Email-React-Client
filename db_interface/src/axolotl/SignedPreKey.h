#ifndef SIGNEDPREKEY_H_
#define SIGNEDPREKEY_H_

#include <string>
#include <cstring>
#include <vector>
#include <sqlite_modern_cpp/sqlcipher.h>
#include "../dbUtils.h"

using namespace std;

namespace CriptextDB {

  struct SignedPreKey { 
    int id;
    string record;
    int len;
  };

  SignedPreKey getSignedPreKey(string dbPath, string password, short int id);

  bool createSignedPreKey(string dbPath, string password, short int id, char *keyRecord, size_t len);

  bool deleteSignedPreKey(string dbPath, string password, short int id);
} 

#endif