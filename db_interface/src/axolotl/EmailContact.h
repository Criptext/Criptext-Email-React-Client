#ifndef EMAIL_CONTACT_H_
#define EMAIL_CONTACT_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct EmailContact {
    int id;
    int contactId;
    int emailId;
    string type;
  };

  int createEmailContact(string dbPath, int contactId, int emailId, string type);
  int deleteEmailContactByEmailId(string dbPath, int emailId);
  vector<EmailContact> getEmailContactByEmailId(string dbPath, int emailId);
} 

#endif