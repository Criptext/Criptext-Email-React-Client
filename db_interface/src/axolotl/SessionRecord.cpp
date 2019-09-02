#include "SessionRecord.h"

using namespace sqlite;
using namespace std;

CriptextDB::SessionRecord CriptextDB::getSessionRecord(string dbPath, string recipientId, long int deviceId) {
  sqlite_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
  database db(dbPath, config);
  
  std::cout << 14 << " : " << recipientId << " : " << deviceId << std::endl;
  char *myRecord;
  int myLen = 0;
  db << "Select * from sessionrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string record, int recordLength) {
        std::cout << 14.5 << " : " << record << std::endl;
        myLen = recordLength;
        myRecord = (char *)malloc(recordLength);
        strcpy(myRecord, record.c_str());
    };
  if (myLen == 0) {
    std::cout << 15 << std::endl;
    throw std::invalid_argument("row not available");
  }
  std::cout << 15.1 << " : " << myRecord << std::endl;
  SessionRecord sessionRecord = { 
    .recipientId = recipientId, 
    .deviceId = deviceId, 
    .record = myRecord, 
    .len = (size_t)myLen 
  };

  std::cout << 16 << " : " << sessionRecord.record << std::endl;
  return sessionRecord;
}

vector<CriptextDB::SessionRecord> CriptextDB::getSessionRecords(string dbPath, string recipientId) {
  vector<CriptextDB::SessionRecord> sessionRecords;
  std::cout << 17 << std::endl;
  try {
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
    database db(dbPath, config);

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
    std::cout << 18 << std::endl;
  } catch (exception& e) {
    std::cout << e.what() << std::endl; 
    return sessionRecords;
  }

  return sessionRecords;
}

bool CriptextDB::createSessionRecord(string dbPath, string recipientId, long int deviceId, char* record, size_t len) {
  try {
    std::cout << 19 << std::endl;
    bool hasRow;
              
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    database db(dbPath, config);

    db << "begin;";
    db << "Select * from sessionrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string record, int recordLength) {
        hasRow = true;
    };
    std::cout << 20 << std::endl;
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
    std::cout << 21 << std::endl;
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }
  return true;
}

bool CriptextDB::deleteSessionRecord(string dbPath, string recipientId, long int deviceId) {
  try {
    std::cout << 22 << std::endl;
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    database db(dbPath, config);
    db << "delete from sessionrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId;
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }
  std::cout << 23 << std::endl;
  return true;
}

bool CriptextDB::deleteSessionRecords(string dbPath, string recipientId) {
  try {
    std::cout << 24 << std::endl;
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    database db(dbPath, config);

    db << "delete from sessionrecord where recipientId == ?;"
     << recipientId;
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }
  std::cout << 25 << std::endl;
  return true;
}