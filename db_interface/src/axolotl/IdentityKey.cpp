#include "IdentityKey.h"
#include <string>
#include <iostream>

using namespace sqlite;
using namespace std;

CriptextDB::IdentityKey CriptextDB::getIdentityKey(database db, int accountId, string recipientId, long int deviceId) {
  IdentityKey identityKey;
  db << "Select * from identitykeyrecord where recipientId == ? and deviceId == ? and accountId == ?;"
     << recipientId
     << deviceId
     << accountId
     >> [&] (string recipientId, int deviceId, string identity) {
        identityKey = { 
          .recipientId = recipientId, 
          .deviceId = deviceId, 
          .identityKey = identity
        };
    };

  if (identityKey.deviceId == 0 || identityKey.identityKey.empty()) {
    throw std::invalid_argument("row not available");
  }
  return identityKey;
}

bool CriptextDB::createIdentityKey(database db, int accountId, string recipientId, int deviceId, char *identityKey) {
  try {
    bool hasRow = false;
    db << "begin;";
    db << "Select * from identitykeyrecord where recipientId == ? and deviceId == ? and accountId == ?;"
     << recipientId
     << deviceId
     << accountId
     >> [&] (string recipientId, int deviceId, string identity) {
        hasRow = true;
    };
    if (hasRow) {
      db << "update identitykeyrecord set identityKey = ? where recipientId == ? and deviceId == ? and accountId == ?;"
        << identityKey
        << recipientId
        << deviceId
        << accountId;
    } else {
      db << "insert into identitykeyrecord (recipientId, deviceId, identityKey, accountId) values (?,?,?,?);"
        << recipientId
        << deviceId
        << identityKey
        << accountId;
    }
    db << "commit;";
  } catch (exception& e) {
    std::cout << "ERROR Creating Identity Key: " << e.what() << std::endl;
    return false;
  }
  return true;
}