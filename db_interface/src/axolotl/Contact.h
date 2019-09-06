#ifndef CONTACT_H_
#define CONTACT_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <sqlite_modern_cpp.h>
#include <string>
#include <memory>
#include <vector>
#include <cjson/cJSON.h>

using namespace std;

namespace CriptextDB {
  struct Contact {
    int id;
    string email;
    string name;
    bool isTrusted;
    int score;
    int spamScore;
  };

  int createContact(string dbPath, string email, string name, bool isTrusted, int score, int spamScore);
  int insertContacts(string dbPath, vector<Contact> contacts);
  int updateContactName(string dbPath, string email, string name);
  Contact getContactByEmail(string dbPath, string email);
  vector<Contact> getAllContacts(string dbPath);
  vector<Contact> getContactsByEmailIdAndType(string dbPath, int emailId, string type);
} 

#endif