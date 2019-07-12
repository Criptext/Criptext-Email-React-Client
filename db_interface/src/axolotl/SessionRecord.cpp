#include "SessionRecord.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>
#include <iostream>

using namespace std;

CriptextDB::SessionRecord CriptextDB::getSessionRecord(string dbPath, string recipientId, long int deviceId) {
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ? and deviceId == ?");
  query.bind(1, recipientId);
  query.bind(2, deviceId);

  query.executeStep();
  SessionRecord sessionRecord = { query.getColumn(1).getString(), query.getColumn(2).getInt(), query.getColumn(3).getString() };
  return sessionRecord;
}

vector<CriptextDB::SessionRecord> CriptextDB::getSessionRecords(string dbPath, string recipientId) {
  std::cout << "Get Session Records : " << recipientId << std::endl;
  vector<CriptextDB::SessionRecord> sessionRecords;

  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ?");
    query.bind(1, recipientId);

    while (query.executeStep()) {
      CriptextDB::SessionRecord sessionRecord = { query.getColumn(1).getString(), query.getColumn(2).getInt(), query.getColumn(3).getString() };
      sessionRecords.push_back(sessionRecord);
    }
  } catch (exception& e) {
    return sessionRecords;
  }

  return sessionRecords;
}

bool CriptextDB::createSessionRecord(string dbPath, string recipientId, long int deviceId, string record) {
  std::cout << "Create Session Record : " << recipientId << std::endl;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    SQLite::Transaction transaction(db);

    SQLite::Statement getQuery(db, "Select * from sessionrecord where recipientId == ?");
    getQuery.bind(1, recipientId);
    getQuery.executeStep();

    if (getQuery.hasRow()) {
      int rowId = getQuery.getColumn(0).getInt();
      SQLite::Statement query(db, "update sessionrecord set record = ? where id == ?");
      query.bind(1, record);
      query.bind(2, rowId);
      query.exec();
    } else {
      SQLite::Statement query(db, "insert into sessionrecord (recipientId, deviceId, record) values (?,?,?)");
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, record);
      query.exec();
    }

    transaction.commit();
  } catch (exception& e) {
    return false;
  }

  return true;
}

bool CriptextDB::deleteSessionRecord(string dbPath, string recipientId, long int deviceId) {
  std::cout << "Delete Session Record : " << recipientId << std::endl;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "delete from sessionrecord where recipientId == ? and deviceId == ?");
    query.bind(1, recipientId);
    query.bind(2, deviceId);

    query.exec();
  } catch (exception& e) {
    return false;
  }

  return true;
}

bool CriptextDB::deleteSessionRecords(string dbPath, string recipientId) {
  std::cout << "Delete Session Records : " << recipientId << std::endl;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "delete from sessionrecord where recipientId == ?");
    query.bind(1, recipientId);

    query.exec();
  } catch (exception& e) {
    return false;
  }

  return true;
}