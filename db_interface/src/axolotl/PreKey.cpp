#include "PreKey.h"

using namespace std;
using namespace sqlite;

CriptextDB::PreKey CriptextDB::getPreKey(database db, int accountId, short int id) {
  string myPreKey;
  size_t myLen = 0;
  db << "Select * from prekeyrecord where preKeyId == ? and accountId == ?;"
     << id
     << accountId
     >> [&] (int preKeyId, string record, int recordLength) {
        myPreKey = record;
        myLen = (size_t)recordLength;
    };

  if (myLen == 0) {
    throw std::invalid_argument("row not available");
  }
  PreKey preKey = { 
    .id = id, 
    .record = myPreKey, 
    .len = myLen
  };
  return preKey;
}

bool CriptextDB::createPreKey(database db, int accountId, short int id, char *keyRecord, size_t len) {
  try {
    bool hasRow = false;
    db << "begin;";
    db << "Select preKeyId from prekeyrecord where preKeyId == ? and accountId == ?;"
     << id
     << accountId
     >> [&] (string preKeyId) {
        hasRow = true;
    };
    if (hasRow) {
      db << "update prekeyrecord set record = ?, recordLength = ? where preKeyId == ? and accountId == ?;"
        << keyRecord
        << static_cast<int>(len)
        << id
        << accountId;
    } else {
      db << "insert into prekeyrecord (preKeyId, record, recordLength, accountId) values (?,?,?,?);"
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

bool CriptextDB::deletePreKey(database db, int accountId, short int id) {
  try {
    db << "delete from prekeyrecord where preKeyId == ? and accountId == ?;"
     << id
     << accountId;
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}
