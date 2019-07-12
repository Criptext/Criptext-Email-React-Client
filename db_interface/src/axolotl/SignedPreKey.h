#ifndef SIGNEDPREKEY_H_
#define SIGNEDPREKEY_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct SignedPreKey { 
    int id;
    string privKey;
    string pubKey;
  };

  SignedPreKey getSignedPreKey(string dbPath, short int id);

  bool createSignedPreKey(string dbPath, short int id, char *keyRecord);

  bool deleteSignedPreKey(string dbPath, short int id);
} 

#endif