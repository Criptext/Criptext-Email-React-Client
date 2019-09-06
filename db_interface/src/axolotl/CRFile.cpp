#include "CRFile.h"
#include "DBUtils.h"
#include <iostream>

using namespace std;

int createFile(string dbPath, string token, string name, int size, int status, string date, string mimeType, optional<string> key, optional<string> iv, optional<string> cid, int emailId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "insert into file (token, name, size, status, date, mimeType, key, iv, cid, emailId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  query.bind(1, token);
  query.bind(2, name);
  query.bind(3, size);
  query.bind(4, status);
  query.bind(5, date);
  query.bind(6, mimeType);
  query.bind(7, key ? *key : "NULL");
  query.bind(8, iv ? *iv : "NULL");
  query.bind(9, cid ? *cid : "NULL");
  query.bind(10, emailId);
  return query.exec();
}

vector<CriptextDB::CRFile> CriptextDB::getFilesByEmailId(string dbPath, int emailId){
  vector<CriptextDB::CRFile> allFiles;
  try {
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
    database db(dbPath, config);

    db << "select * from file where emailId == ?;"
       << emailId
       >> [&] (int id, string token, string name, int size, int status, string date, string mimeType, string key, 
                string iv, string cid, int emailId) {
          CriptextDB::CRFile file = { id, token, name, size, status, date, mimeType, key, iv, cid, emailId };
          allFiles.push_back(file);
       };
    return allFiles;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allFiles;
  }
}

vector<CriptextDB::CRFile> CriptextDB::getFilesByToken(string dbPath, vector<string> tokens){
  vector<CriptextDB::CRFile> allFiles;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    SQLite::Statement query(db, "select * from file where token in (" + DBUtils::joinVector(tokens) + ")");

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        string token = strdup(query.getColumn(1).getText());
        string name = strdup(query.getColumn(2).getText());
        int size = query.getColumn(4).getInt();
        int status = query.getColumn(5).getInt();
        string date = query.getColumn(6).getString();
        string mimeType = query.getColumn(7).getString();
        string key = query.getColumn(13).getString();
        string iv = query.getColumn(14).getString();
        string cid = query.getColumn(15).getString();
        int emailId = query.getColumn(12).getInt();

        CriptextDB::CRFile file = { id, token, name, size, status, date, mimeType, key, iv, cid, emailId };
        
        allFiles.push_back(file);
    }
    return allFiles;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allFiles;
  }
}

int updateFilesByEmailId(string dbPath, int newStatus, int emailId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "update file set status = ? where emailId = ?");
  query.bind(1, newStatus);
  query.bind(2, emailId);
  return query.exec();
}

