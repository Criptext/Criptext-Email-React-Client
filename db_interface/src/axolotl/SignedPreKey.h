#ifndef SIGNEDPREKEY_H_
#define SIGNEDPREKEY_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct SignedPreKey { 
    int id;
    char *record;
    int len;
  };

  SignedPreKey getSignedPreKey(string dbPath, short int id);

  bool createSignedPreKey(string dbPath, short int id, char *keyRecord, size_t len);

  bool deleteSignedPreKey(string dbPath, short int id);
} 

#endif