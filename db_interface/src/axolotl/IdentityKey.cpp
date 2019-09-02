#include "IdentityKey.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <iostream>

using namespace sqlite;
using namespace std;

CriptextDB::IdentityKey CriptextDB::getIdentityKey(string dbPath, string recipientId, long int deviceId) {
  sqlite_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
  database db(dbPath, config);

  IdentityKey identityKey;
  std::cout << 1 << std::endl;
  db << "Select * from identitykeyrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string identity) {
        identityKey = { 
          .recipientId = recipientId, 
          .deviceId = deviceId, 
          .identityKey = identity
        };
    };

  if (identityKey.deviceId == 0) {
    std::cout << 2 << std::endl;
    throw std::invalid_argument("row not available");
  }
  std::cout << 3 << std::endl;
  return identityKey;
}

bool CriptextDB::createIdentityKey(string dbPath, string recipientId, int deviceId, char *identityKey) {
  try {
    std::cout << 4 << std::endl;
    bool hasRow;
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    database db(dbPath, config);
    db << "begin;";
    db << "Select * from identitykeyrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string identity) {
        hasRow = true;
    };
    std::cout << 5 << " : " << hasRow << std::endl;
    if (hasRow) {
      db << "update identitykeyrecord set identityKey = ? where recipientId == ? and deviceId == ?;"
        << identityKey
        << recipientId
        << deviceId;
    } else {
      db << "insert into identitykeyrecord (recipientId, deviceId, identityKey) values (?,?,?);"
        << recipientId
        << deviceId
        << identityKey;
    }
    db << "commit;";
    std::cout << 6 << std::endl;
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }
  return true;
}