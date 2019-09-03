#include "SignedPreKey.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>
#include <iostream>
#include <sstream>

using namespace std;
using namespace sqlite;

CriptextDB::SignedPreKey CriptextDB::getSignedPreKey(string dbPath, short int id) {
  sqlite_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
  database db(dbPath, config);

  char *mySignedPreKey;
  int myLen;
  std::cout << 26 << std::endl;
  db << "Select * from signedprekeyrecord where signedPreKeyId == ?;"
     << id
     >> [&] (int preKeyId, string record, int recordLength) {
        std::cout << 26.3 << " : " << record << std::endl;
        mySignedPreKey = (char *)malloc(record.length());
        strcpy(mySignedPreKey, record.c_str());
        myLen = (size_t)recordLength;
        
    };
  std::cout << 26.5 << std::endl;
  if (!mySignedPreKey) {
    throw std::invalid_argument("row not available");
  }
  SignedPreKey signedPreKey = { 
    .id = id, 
    .record = mySignedPreKey, 
    .len = myLen 
  };
  std::cout << 27 << std::endl;
  return signedPreKey;
}

bool CriptextDB::createSignedPreKey(string dbPath, short int id, char *keyRecord, size_t len) {
  try {
    std::cout << 28 << std::endl;
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    database db(dbPath, config);  
    db << "insert into signedprekeyrecord (signedPreKeyId, record, recordLength) values (?,?,?);"
     << id
     << keyRecord
     << static_cast<int>(len);
    std::cout << 29 << std::endl;
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}

bool CriptextDB::deleteSignedPreKey(string dbPath, short int id) {
  try {
    std::cout << 29 << std::endl;
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    database db(dbPath, config);
    db << "delete from signedPrekeyrecord where signedPreKeyId == ?;"
     << id;
    std::cout << 30 << std::endl;
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}