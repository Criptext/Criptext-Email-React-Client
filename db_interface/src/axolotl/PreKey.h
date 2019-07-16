#ifndef PREKEY_H_
#define PREKEY_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>

using namespace std;

namespace CriptextDB {

  struct PreKey { 
    int id;
    char* record;
    size_t len;
  };

  PreKey getPreKey(string dbPath, short int id);
  bool createPreKey(string dbPath, short int id, char *keyRecord, size_t len);
  bool deletePreKey(string dbPath, short int id);

} 

#endif