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

  SignedPreKey getSignedPreKey(string dbPath, short int id, int accountId);

  bool createSignedPreKey(string dbPath, short int id, char *keyRecord, int accountId);

  bool deleteSignedPreKey(string dbPath, short int id, int accountId);
} 

#endif