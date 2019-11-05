#include "PreKey.h"

using namespace std;
using namespace sqlite;

CriptextDB::PreKey CriptextDB::getPreKey(string dbPath, string password, short int id) {
  database db = initializeDB(dbPath, password);
  string myPreKey;
  size_t myLen = 0;
  db << "Select * from prekeyrecord where preKeyId == ?;"
     << id
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

bool CriptextDB::createPreKey(string dbPath, string password, short int id, char *keyRecord, size_t len) {
  try {
    database db = initializeDB(dbPath, password);
    db << "insert into prekeyrecord (preKeyId, record, recordLength) values (?,?,?);"
     << id
     << keyRecord
     << static_cast<int>(len);
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}

bool CriptextDB::deletePreKey(string dbPath, string password, short int id) {
  try {
    database db = initializeDB(dbPath, password);
    db << "delete from prekeyrecord where preKeyId == ?;"
     << id;
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}
