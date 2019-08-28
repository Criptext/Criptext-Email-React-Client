#include "EmailContact.h"
#include <iostream>
#include <vector>

using namespace std;

int CriptextDB::createEmailContact(string dbPath, int contactId, int emailId, string type) {
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "insert into emailContact (contactId, emailId, type) values (?,?,?)");
  query.bind(1, contactId);
  query.bind(2, emailId);
  query.bind(3, type);
  return query.exec();
}

int CriptextDB::deleteEmailContactByEmailId(string dbPath, int emailId) {
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from emailContact where emailId == ?");
  query.bind(1, emailId);
  return query.exec();
}



vector<CriptextDB::EmailContact> CriptextDB::getEmailContactByEmailId(string dbPath, int emailId) {
  vector<CriptextDB::EmailContact> allEmailContacts;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "select * from emailLabel where emailId == ?");
    query.bind(1, emailId);
    while(query.executeStep()){

      int id = query.getColumn(0).getInt();
      int labelId = query.getColumn(1).getInt();
      int emailId = query.getColumn(2).getInt();

      CriptextDB::EmailContact emailContact = { id, labelId, emailId };
      allEmailContacts.push_back(emailContact);
    }
    return allEmailContacts;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allEmailContacts;
  }
}

