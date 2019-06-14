#include "SessionRecord.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>
#include <iostream>

using namespace std;

CriptextDB::SessionRecord CriptextDB::getSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId) {
  std::cout << "Get Session Record : " << accountId << std::endl;
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ? and deviceId == ? and accountId == ?");
  query.bind(1, recipientId);
  query.bind(2, deviceId);
  query.bind(3, accountId);

  query.executeStep();
  SessionRecord sessionRecord = { query.getColumn(1).getString(), query.getColumn(2).getInt(), query.getColumn(3).getString() };
  return sessionRecord;
}

vector<CriptextDB::SessionRecord> CriptextDB::getSessionRecords(string dbPath, int accountId, string recipientId) {
  std::cout << "Get Session Records : " << recipientId << std::endl;
  vector<CriptextDB::SessionRecord> sessionRecords;

  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ? and accountId == ?");
    query.bind(1, recipientId);
    query.bind(2, accountId);

    while (query.executeStep()) {
      CriptextDB::SessionRecord sessionRecord = { query.getColumn(1).getString(), query.getColumn(2).getInt(), query.getColumn(3).getString() };
      sessionRecords.push_back(sessionRecord);
    }
  } catch (exception& e) {
    return sessionRecords;
  }

  return sessionRecords;
}

bool CriptextDB::createSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId, string record) {
  std::cout << "Create Session Record : " << recipientId << std::endl;
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

bool CriptextDB::deleteSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId) {
  std::cout << "Delete Session Record : " << recipientId << std::endl;
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

bool CriptextDB::deleteSessionRecords(string dbPath, int accountId, string recipientId) {
  std::cout << "Delete Session Records : " << recipientId << std::endl;
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