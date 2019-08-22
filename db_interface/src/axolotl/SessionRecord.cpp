#include "SessionRecord.h"

using namespace sqlite;
using namespace std;

CriptextDB::SessionRecord CriptextDB::getSessionRecord(string dbPath, string recipientId, long int deviceId) {
  database db(dbPath);
  SessionRecord *sessionRecord;

  db << "Select * from sessionrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string record, int recordLength) {
        char *myRecord = const_cast<char *>(record.c_str());
        SessionRecord mySessionRecord = { 
          .recipientId = recipientId, 
          .deviceId = deviceId, 
          .record = myRecord, 
          .len = (size_t)recordLength 
        };
        sessionRecord = &mySessionRecord;
    };

  if (!sessionRecord) {
    throw std::invalid_argument("row not available");
  }
  return *sessionRecord;
}

vector<CriptextDB::SessionRecord> CriptextDB::getSessionRecords(string dbPath, string recipientId) {
  vector<CriptextDB::SessionRecord> sessionRecords;

  try {
    SQLite::Database db(dbPath);
    db.setBusyTimeout(5000);

    SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ?");
    query.bind(1, recipientId);

    while (query.executeStep()) {
      char *record = strdup(query.getColumn(1).getText());
      CriptextDB::SessionRecord sessionRecord = { query.getColumn(0).getString(), (long)query.getColumn(1).getInt(), record, (size_t)query.getColumn(3).getInt() };
      sessionRecords.push_back(sessionRecord);
    }
  } catch (exception& e) {
    return sessionRecords;
  }

  return sessionRecords;
}

bool CriptextDB::createSessionRecord(string dbPath, string recipientId, long int deviceId, char* record, size_t len) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    db.setBusyTimeout(5000);
    //SQLite::Transaction transaction(db);

    SQLite::Statement getQuery(db, "Select * from sessionrecord where recipientId == ? and deviceId == ?");
    getQuery.bind(1, recipientId);
    getQuery.bind(2, deviceId);
    getQuery.executeStep();

    if (getQuery.hasRow()) {
      while(getQuery.hasRow()) {
        getQuery.executeStep();
      }
      SQLite::Statement query(db, "update sessionrecord set record = ?, recordLength = ? where recipientId == ? and deviceId == ?");
      query.bind(1, record);
      query.bind(2, static_cast<int>(len));
      query.bind(3, recipientId);
      query.bind(4, deviceId);
      query.exec();
    } else {
      SQLite::Statement query(db, "insert into sessionrecord (recipientId, deviceId, record, recordLength) values (?,?,?,?)");
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, record);
      query.bind(4, static_cast<int>(len));
      query.exec();
    }
    //transaction.commit();
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }

  return true;
}

bool CriptextDB::deleteSessionRecord(string dbPath, string recipientId, long int deviceId) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    db.setBusyTimeout(5000);
    SQLite::Statement query(db, "delete from sessionrecord where recipientId == ? and deviceId == ?");
    query.bind(1, recipientId);
    query.bind(2, deviceId);

    query.exec();
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }

  return true;
}

bool CriptextDB::deleteSessionRecords(string dbPath, string recipientId) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    db.setBusyTimeout(5000);
    SQLite::Statement query(db, "delete from sessionrecord where recipientId == ?");
    query.bind(1, recipientId);

    query.exec();
  } catch (exception& e) {
    std::cout << "ERROR : " << e.what() << std::endl;
    return false;
  }

  return true;
}