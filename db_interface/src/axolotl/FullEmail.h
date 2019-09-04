#ifndef FULL_EMAIL_H_
#define FULL_EMAIL_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include "Email.h"
#include "Label.h"
#include "Contact.h"
#include "CRFile.h"
#include "DBUtils.h"
#include <string>
#include <memory>
#include <cjson/cJSON.h>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct FullEmail {
    Email email;
    vector<Label> labels;
    vector<Contact> to;
    vector<Contact> cc;
    vector<Contact> bcc;
    Contact from;
    vector<CRFile> files;
    string preview;
  };

  // vector<FullEmail> getFullEmailsByIds(string dbPath, vector<int> emailIds, int accountId);
  // vector<FullEmail> getFullEmailsByThreadIds(string dbPath, vector<string> threadIds, int accountId);
} 

#endif