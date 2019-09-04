#ifndef EMAIL_LABEL_H_
#define EMAIL_LABEL_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct EmailLabel {
    int id;
    int labelId;
    int emailId;
  };

  int createEmailLabel(string dbPath, int labelId, int emailId);
  int deleteEmailLabelByEmailId(string dbPath, int emailId);
  vector<EmailLabel> getEmailLabelsByEmailId(string dbPath, int emailId);
} 

#endif