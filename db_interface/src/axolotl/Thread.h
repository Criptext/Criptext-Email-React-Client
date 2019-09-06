#ifndef THREAD_H_
#define THREAD_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <sqlite_modern_cpp.h>
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
#include <algorithm>
#include <iterator>
#include <cctype>

using namespace std;

namespace CriptextDB {
  struct Thread {
    unordered_set<int> labelIds;
    optional<string> boundary;
    string lastEmailContent;
    string date;
    vector<int> emailIds;
    vector<string> fileTokens;
    string fromAddress;
    string fromContactNames;
    int lastEmailId;
    string lastEmailKey;
    string maxDate;
    string messageId;
    string preview;
    unordered_set<int> recipientContactIds;
    optional<string> replyTo;
    bool secure;
    int status;
    string subject;
    string threadId;
    optional<string> trashDate;
    bool unread;
    optional<string> unsendDate;

    cJSON *toJSON(){
      cJSON *thread = cJSON_CreateObject();
      if(thread == NULL){
        return NULL;
      }
      cJSON_AddItemToObject(thread, "allLabels", cJSON_CreateString(DBUtils::joinSet(labelIds).c_str()));
      cJSON_AddItemToObject(thread, "boundary", cJSON_CreateString(boundary ? (*boundary).c_str() : NULL));
      cJSON_AddItemToObject(thread, "content", cJSON_CreateString(lastEmailContent.c_str()));
      cJSON_AddItemToObject(thread, "date", cJSON_CreateString(date.c_str()));
      cJSON_AddItemToObject(thread, "emailIds", cJSON_CreateString(DBUtils::joinVector(emailIds).c_str()));
      cJSON_AddItemToObject(thread, "fileTokens", cJSON_CreateString(DBUtils::joinVector(fileTokens).c_str()));
      cJSON_AddItemToObject(thread, "fromAddress", cJSON_CreateString(fromAddress.c_str()));
      cJSON_AddItemToObject(thread, "fromContactName", cJSON_CreateString(fromContactNames.c_str()));
      cJSON_AddItemToObject(thread, "id", cJSON_CreateString(to_string(lastEmailId).c_str()));
      cJSON_AddItemToObject(thread, "isMuted", cJSON_CreateBool(false));
      cJSON_AddItemToObject(thread, "key", cJSON_CreateString(lastEmailKey.c_str()));
      cJSON_AddItemToObject(thread, "maxDate", cJSON_CreateString(maxDate.c_str()));
      cJSON_AddItemToObject(thread, "messageId", cJSON_CreateString(messageId.c_str()));
      cJSON_AddItemToObject(thread, "preview", cJSON_CreateString(preview.c_str()));
      cJSON_AddItemToObject(thread, "recipientContactIds", cJSON_CreateString(DBUtils::joinSet(recipientContactIds).c_str()));
      cJSON_AddItemToObject(thread, "replyTo", cJSON_CreateString(replyTo ? (*replyTo).c_str() : NULL));
      cJSON_AddItemToObject(thread, "s3Key", cJSON_CreateString(""));
      cJSON_AddItemToObject(thread, "secure", cJSON_CreateBool(secure));
      cJSON_AddItemToObject(thread, "status", cJSON_CreateNumber(status));
      cJSON_AddItemToObject(thread, "subject", cJSON_CreateString(subject.c_str()));
      cJSON_AddItemToObject(thread, "threadId", cJSON_CreateString(threadId.c_str()));
      cJSON_AddItemToObject(thread, "trashDate", cJSON_CreateString(trashDate ? (*trashDate).c_str() : NULL));
      cJSON_AddItemToObject(thread, "uniqueId", cJSON_CreateString(threadId.c_str()));
      cJSON_AddItemToObject(thread, "unread", cJSON_CreateBool(unread));
      cJSON_AddItemToObject(thread, "unsendDate", cJSON_CreateString(unsendDate ? (*unsendDate).c_str() : NULL));

      return thread;
    }
  };

  string getThreadsByThreadIds(string dbPath, vector<string> threadIds, int labelId, string date, int limit, int accountId);
  cJSON* getThreadsByLabel(string dbPath, vector<int> rejectedLabels, int labelId, string date, int limit, int accountId);
} 

#endif