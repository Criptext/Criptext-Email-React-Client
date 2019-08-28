#ifndef THREAD_H_
#define THREAD_H_

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
#include <unordered_set>

using namespace std;

namespace CriptextDB {
  struct Thread {
    unordered_set<int> labelIds;
    optional<string> boundary;
    string lastEmailContent;
    time_t date;
    vector<int> emailIds;
    vector<string> fileTokens;
    string fromAddress;
    string fromContactNames;
    int lastEmailId;
    string lastEmailKey;
    time_t max_date;
    string messageId;
    string preview;
    vector<int> recipientContactIds;
    optional<string> replyTo;
    bool secure;
    int satatus;
    string subject;
    string threadId;
    bool unread;
    optional<time_t> unsendDate;
  };

  string getThreadsByThreadIds(string dbPath, vector<string> threadIds, int labelId, string date, int limit, int accountId);
} 

#endif