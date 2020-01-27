#include "SignedPreKey.h"
#include <string>
#include <vector>
#include <iostream>
#include <sstream>

using namespace std;
using namespace sqlite;

CriptextDB::SignedPreKey CriptextDB::getSignedPreKey(database db, string password, short int id) {
  string mySignedPreKey;
  int myLen = 0;
  db << "Select * from signedprekeyrecord where signedPreKeyId == ?;"
     << id
     >> [&] (int preKeyId, string record, int recordLength) {
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

bool CriptextDB::createSignedPreKey(database db, string password, short int id, char *keyRecord, size_t len) {
  try {
    db << "insert into signedprekeyrecord (signedPreKeyId, record, recordLength) values (?,?,?);"
     << id
     << keyRecord
     << static_cast<int>(len);
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}

bool CriptextDB::deleteSignedPreKey(database db, string password, short int id) {
  try {
    db << "delete from signedPrekeyrecord where signedPreKeyId == ?;"
     << id;
    return true;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return false;
  }
}