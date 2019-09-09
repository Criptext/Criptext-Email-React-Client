#include "EmailLabel.h"
#include <iostream>

using namespace std;
using namespace sqlite;

int CriptextDB::createEmailLabel(string dbPath, int labelId, int emailId) {
SQLite::Database db(dbPath);

  SQLite::Statement query(db, "insert into emailLabel (labelId, emailId) values (?,?,?)");
  query.bind(1, labelId);
  query.bind(2, emailId);
  return query.exec();
}

int CriptextDB::deleteEmailLabelByEmailId(string dbPath, int emailId) {
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from emailLabel where emailId == ?");
  query.bind(1, emailId);
  return query.exec();
}

vector<CriptextDB::EmailLabel> CriptextDB::getEmailLabelsByEmailId(string dbPath, int emailId) {
  vector<EmailLabel> allEmailLabels;
  try {
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
    database db(dbPath, config);

    db << "select * from emailLabel where emailId == ?;"
       << emailId
       >> [&] (int id, int labelId, int emailId){
          EmailLabel emailLabel = { id, labelId, emailId };
          allEmailLabels.push_back(emailLabel);
       };
    return allEmailLabels;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allEmailLabels;
  }
}

