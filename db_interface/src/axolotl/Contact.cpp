#include "Contact.h"
#include <iostream>
#include <vector>

using namespace std;

CriptextDB::Contact CriptextDB::getContactByEmail(string dbPath, string email) {
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "select * from contact where email == ?");
  query.bind(1, email);

  query.executeStep();

  if (!query.hasRow()) {
    Contact emptyContact = { .id = 0, .email = "nobody@criptext.com", .name = "NOBODY", .isTrusted = false, .score = 0, .spamScore = 0};
    return emptyContact;
  }

  int id = query.getColumn(0).getInt();
  string mail = strdup(query.getColumn(1).getText());
  string name = strdup(query.getColumn(2).getText());
  bool isTrusted = query.getColumn(3).getInt();
  int score = query.getColumn(4).getInt();
  int spamScore = query.getColumn(5).getInt();

  Contact contact = { id, mail, name, isTrusted, score, spamScore };
  return contact;
}

int CriptextDB::insertContacts(string dbPath, vector<Contact> contacts){
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "insert into account (recipientId, name, deviceId, jwt, refreshToken, privKey, pubKey, registrationId) values (?,?,?,?,?,?,?,?)");
    SQLite::Transaction transaction(db);  
    
    for(const CriptextDB::Contact &contact : contacts){
      query.bind(1, contact.email);
      query.bind(2, contact.name);
      query.bind(3, contact.isTrusted);
      query.bind(4, contact.score);
      query.bind(5, contact.spamScore);
      query.exec();
    }

    transaction.commit();

    return 0;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return -1;
  }
}

int CriptextDB::createContact(string dbPath, string email, string name, bool isTrusted, int score, int spamScore) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "insert into contact (email, name, isTrusted, score, spamScore) values (?,?,?,?,?)");
    query.bind(1, email);
    query.bind(2, name);
    query.bind(3, isTrusted);
    query.bind(4, score);
    query.bind(5, spamScore);

    return query.exec();
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return -1;
  }
}

int CriptextDB::updateContactName(string dbPath, string email, string name) {
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "update contact set name = ? where email == ?");
    query.bind(1, name);
    query.bind(2, email);

    return query.exec();
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return -1;
  }
}

std::vector<CriptextDB::Contact> CriptextDB::getAllContacts(string dbPath) {
  std::vector<Contact> allContacts;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "select * from contact order by score desc");

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        string email = strdup(query.getColumn(1).getText());
        string name = strdup(query.getColumn(2).getText());
        bool isTrusted = query.getColumn(3).getInt();
        int score = query.getColumn(4).getInt();
        int spamScore = query.getColumn(5).getInt();

        Contact contact = { id, email, name, isTrusted, score, spamScore };
        
        allContacts.push_back(contact);
    }
    return allContacts;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allContacts;
  }
}

vector<CriptextDB::Contact> CriptextDB::getContactsByEmailIdAndType(string dbPath, int emailId, string type) {
  vector<CriptextDB::Contact> allContacts;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "SELECT contact.* FROM contact "
            "INNER JOIN emailContact "
            "ON contact.id = emailContact.contactId "
            "WHERE emailContact.emailId == ? "
            "AND emailContact.type == ?");
    query.bind(1, emailId);
    query.bind(2, type);
    while(query.executeStep()){

      int id = query.getColumn(0).getInt();
        string email = strdup(query.getColumn(1).getText());
        string name = strdup(query.getColumn(2).getText());
        bool isTrusted = query.getColumn(3).getInt();
        int score = query.getColumn(4).getInt();
        int spamScore = query.getColumn(5).getInt();

        Contact contact = { id, email, name, isTrusted, score, spamScore };
        
        allContacts.push_back(contact);
    }
    return allContacts;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allContacts;
  }
}
