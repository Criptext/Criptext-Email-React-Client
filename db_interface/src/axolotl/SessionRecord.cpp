#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct SessionRecord {
    string recipientId;
    long int deviceId;
    string record;
  };

  SessionRecord getSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId) {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ? and deviceId == ? and accountId == ?");
    query.bind(1, recipientId);
    query.bind(2, deviceId);
    query.bind(3, accountId);

    query.executeStep();
    SessionRecord sessionRecord = { query.getColumn(1).getString(), query.getColumn(2).getInt(), query.getColumn(3).getString() };
    return sessionRecord;
  }

  vector<SessionRecord> getSessionRecords(string dbPath, int accountId, string recipientId) {

    vector<SessionRecord> sessionRecords;

    try {
      SQLite::Database db(dbPath);

      SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ? and accountId == ?");
      query.bind(1, recipientId);
      query.bind(2, accountId);

      while (query.executeStep()) {
        SessionRecord sessionRecord = { query.getColumn(1).getString(), query.getColumn(2).getInt(), query.getColumn(3).getString() };
        sessionRecords.push_back(sessionRecord);
      }
    } catch (exception& e) {
      return sessionRecords;
    }

    return sessionRecords;
  }

  bool createSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId, string record) {
    try {
      SQLite::Database db(dbPath);

      SQLite::Statement query(db, "insert into sessionrecord (recipientId, deviceId, record, accountId) values (?,?,?,?)");
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, accountId);
      query.bind(4, record);

      query.exec();
    } catch (exception& e) {
      return false;
    }

    return true;
  }

  bool deleteSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId) {
    try {
      SQLite::Database db(dbPath);

      SQLite::Statement query(db, "delete from sessionrecord where recipientId == ? and deviceId == ? and accountId == ?");
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, accountId);

      query.exec();
    } catch (exception& e) {
      return false;
    }

    return true;
  }

  bool deleteSessionRecords(string dbPath, int accountId, string recipientId) {
    try {
      SQLite::Database db(dbPath);

      SQLite::Statement query(db, "delete from sessionrecord where recipientId == ? and accountId == ?");
      query.bind(1, recipientId);
      query.bind(2, accountId);

      query.exec();
    } catch (exception& e) {
      return false;
    }

    return true;
  }

} 