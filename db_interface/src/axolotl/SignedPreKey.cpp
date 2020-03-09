#include "SignedPreKey.h"
#include <string>
#include <vector>
#include <iostream>
#include <sstream>

using namespace std;
using namespace sqlite;

CriptextDB::SignedPreKey CriptextDB::getSignedPreKey(database db, int accountId, short int id) {
  string mySignedPreKey;
  int myLen = 0;
  db << "Select * from signedprekeyrecord where signedPreKeyId == ? and accountId == ?;"
     << id
     << accountId
     >> [&] (int id, int preKeyId, string record, int recordLength) {
        mySignedPreKey = record;
        myLen = (size_t)recordLength;
    };
  if (myLen == 0) {
    throw std::invalid_argument("row not available");
  }
  SignedPreKey signedPreKey = { 
    .id = id, 
    .record = mySignedPreKey, 
    .len = myLen 
  };
  return signedPreKey;
}

bool CriptextDB::createSignedPreKey(database db, int accountId, short int id, char *keyRecord, size_t len) {
  try {
    bool hasRow = false;
    db << "begin;";
    db << "Select signedPreKeyId from signedprekeyrecord where signedPreKeyId == ? and accountId == ?;"
     << id
     << accountId
     >> [&] (string signedPreKeyId) {
        hasRow = true;
    };
    if (hasRow) {
      db << "update signedprekeyrecord set record = ?, recordLength = ? where signedPreKeyId == ? and accountId == ?;"
        << keyRecord
        << static_cast<int>(len)
        << id
        << accountId;
    } else {
      db << "insert into signedprekeyrecord (signedPreKeyId, record, recordLength, accountId) values (?,?,?,?);"
        << id
        << keyRecord
        << static_cast<int>(len)
        << accountId;
    }
    db << "commit;";
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}

bool CriptextDB::deleteSignedPreKey(database db, int accountId, short int id) {
  try {
    db << "delete from signedPrekeyrecord where signedPreKeyId == ? and accountId == ?;"
     << id
     << accountId;
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}