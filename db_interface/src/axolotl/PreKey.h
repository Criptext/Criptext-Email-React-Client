#ifndef PREKEY_H_
#define PREKEY_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>

using namespace std;

namespace CriptextDB {

  struct PreKey { 
    int id;
    string privKey;
    string pubKey;
  };

  PreKey getPreKey(string dbPath, short int id, int accountId);
  bool createPreKey(string dbPath, short int id, char *keyRecord, int accountId);
  bool deletePreKey(string dbPath, short int id, int accountId);

} 

#endif