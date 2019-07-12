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

  PreKey getPreKey(string dbPath, short int id);
  bool createPreKey(string dbPath, short int id, char *keyRecord);
  bool deletePreKey(string dbPath, short int id);

} 

#endif