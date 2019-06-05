#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct SessionRecord {
    string recipientId;
    long int deviceId;
    string record;
  }

  unique_ptr<SessionRecord> getSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'Select * from sessionrecord where recipientId == ? and deviceId == ? and accountId == ?')
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, accountId)

      query.executeStep();
    } catch (exception& e) {
      return NULL;
    }

    SessionRecord sessionRecord = { query.getColumn(0).getString(), query.getColumn(1).getInt(), query.getColumn(2).getString() }

    return sessionRecord
  }

  vector<unique_ptr<SessionRecord>> getSessionRecords(string dbPath, int accountId, string recipientId) {

    vector<unique_ptr<SessionRecord>> sessionRecords;

    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'Select * from sessionrecord where recipientId == ? and accountId == ?')
      query.bind(1, recipientId);
      query.bind(2, accountId)

      while (query.executeStep()) {
        SessionRecord sessionRecord = { query.getColumn(0).getString(), query.getColumn(1).getInt(), query.getColumn(2).getString() }
        sessionRecords.push_back(sessionRecord)
      }
    } catch (exception& e) {
      return NULL;
    }

    return sessionRecords
  }

  bool createSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId, string record) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'insert into sessionrecord (recipientId, deviceId, record, accountId) values (?,?,?,?)')
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, accountId);
      query.bind(4, record);

      query.exec();
    } catch (exception& e) {
      return false
    }

    return true
  }

  bool deleteSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId, string record) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'delete from sessionrecord where recipientId == ? and deviceId == ? and accountId == ?')
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, accountId);

      query.exec();
    } catch (exception& e) {
      return false
    }

    return true
  }

  bool deleteSessionRecords(string dbPath, int accountId, string recipientId, string record) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'delete from sessionrecord where recipientId == ? and accountId == ?')
      query.bind(1, recipientId);
      query.bind(2, accountId);

      query.exec();
    } catch (exception& e) {
      return false
    }

    return true
  }

} 