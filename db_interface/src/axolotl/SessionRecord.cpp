#include "SessionRecord.h"

using namespace sqlite;
using namespace std;

CriptextDB::SessionRecord CriptextDB::getSessionRecord(database db, string password, string recipientId, long int deviceId) {
  string myRecord;
  int myLen = 0;
  db << "Select * from sessionrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string record, int recordLength) {
        myLen = recordLength;
        myRecord = record;
    };
  if (myLen == 0) {
    throw std::invalid_argument("row not available");
  }
  SessionRecord sessionRecord = { 
    .recipientId = recipientId, 
    .deviceId = deviceId, 
    .record = myRecord, 
    .len = (size_t)myLen 
  };

  return sessionRecord;
}

vector<CriptextDB::SessionRecord> CriptextDB::getSessionRecords(database db, string password, string recipientId) {
  vector<CriptextDB::SessionRecord> sessionRecords;

  try {
    db << "Select * from sessionrecord where recipientId == ?;"
     << recipientId
     >> [&] (string recipientId, int deviceId, string record, int recordLength) {
        SessionRecord mySessionRecord = { 
          .recipientId = recipientId, 
          .deviceId = deviceId, 
          .record = const_cast<char *>(record.c_str()), 
          .len = (size_t)recordLength 
        };
        sessionRecords.push_back(mySessionRecord);
    };
  } catch (exception& e) {
    std::cout << e.what() << std::endl; 
    return sessionRecords;
  }

  return sessionRecords;
}

bool CriptextDB::createSessionRecord(database db, string password, string recipientId, long int deviceId, char* record, size_t len) {
  try {
    bool hasRow = false;
    db << "begin;";
    db << "Select * from sessionrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string record, int recordLength) {
        hasRow = true;
    };
    if (hasRow) {
      db << "update sessionrecord set record = ?, recordLength = ? where recipientId == ? and deviceId == ?;"
        << record
        << static_cast<int>(len)
        << recipientId
        << deviceId;
    } else {
      db << "insert into sessionrecord (recipientId, deviceId, record, recordLength) values (?,?,?,?);"
        << recipientId
        << deviceId
        << record
        << static_cast<int>(len);
    }
    db << "commit;";
  } catch (exception& e) {
    std::cout << "ERROR CREATING SESSION: " << e.what() << std::endl;
    return false;
  }
  return true;
}

bool CriptextDB::deleteSessionRecord(database db, string password, string recipientId, long int deviceId) {
  try {
    db << "delete from sessionrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId;
  } catch (exception& e) {
    std::cout << "Error deleting session : " << e.what() << std::endl;
    return false;
  }
  return true;
}

bool CriptextDB::deleteSessionRecords(database db, string password, string recipientId) {
  try {
    db << "delete from sessionrecord where recipientId == ?;"
     << recipientId;
  } catch (exception& e) {
    std::cout << "Error deleting sessions : " << e.what() << std::endl;
    return false;
  }
  return true;
}