#include "Thread.h"
#include "FullEmail.h"
#include "EmailLabel.h"
#include "EmailContact.h"
#include <unordered_set>
#include <iostream>
#include <optional>
#include <chrono>

using namespace std;
using namespace sqlite;

string CriptextDB::getThreadsByThreadIds(string dbPath, vector<string> threadIds, int labelId, string date, int limit, int accountId){
  vector<Thread> threads;
  for(const string &threadId: threadIds){
    vector<Email> emails = CriptextDB::getEmailsByThreadIds(dbPath, threadIds, labelId, date, limit, accountId);
    vector<CriptextDB::FullEmail> fullEmails;
    for(const CriptextDB::Email &email : emails){
      vector<CRFile> files = CriptextDB::getFilesByEmailId(dbPath, email.id);
      vector<CriptextDB::EmailLabel> emailLabels = CriptextDB::getEmailLabelsByEmailId(dbPath, email.id);
      vector<int> labelIds;
      for(const CriptextDB::EmailLabel &emailLabel : emailLabels){
          labelIds.push_back(emailLabel.labelId);
      }
      vector<Label> labels = CriptextDB::getLabelsByIds(dbPath, labelIds, accountId);
      vector<Contact> to = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "to");
      vector<Contact> cc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "cc");
      vector<Contact> bcc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "bcc");
      string fromEmail = DBUtils::getFromEmail(email.fromAddress);
      Contact from = CriptextDB::getContactByEmail(dbPath, fromEmail);
      FullEmail fullEmail = { email, labels, to, cc, bcc, from, files, email.preview };

      fullEmails.push_back(fullEmail);
    }
    std::unordered_set<int> labelIds;
    vector<int> emailIds;
    vector<string> fileTokens;
    unordered_set<string> fromNames;
    unordered_set<int> contactIds;
    std::transform(fullEmails.cbegin(), fullEmails.cend(), std::back_inserter(emailIds), [](FullEmail fullEmail) -> int {
      return fullEmail.email.id;
    });
    for(FullEmail &fullEmail : fullEmails) {
      std::transform(fullEmail.labels.cbegin(), fullEmail.labels.cend(), std::inserter(labelIds, labelIds.end()), [](Label label) -> int {
        return label.id;
      });
      std::transform(fullEmail.files.cbegin(), fullEmail.files.cend(), std::back_inserter(fileTokens), [](CRFile file) -> string {
        return file.token;
      });
      std::transform(fullEmail.to.cbegin(), fullEmail.to.cend(), std::inserter(contactIds, contactIds.end()), [](Contact contact) -> int {
        return contact.id;
      });
      std::transform(fullEmail.cc.cbegin(), fullEmail.cc.cend(), std::inserter(contactIds, contactIds.end()), [](Contact contact) -> int {
        return contact.id;
      });
      std::transform(fullEmail.bcc.cbegin(), fullEmail.bcc.cend(), std::inserter(contactIds, contactIds.end()), [](Contact contact) -> int {
        return contact.id;
      });
      contactIds.insert(fullEmail.from.id);
      fromNames.insert(fullEmail.email.fromAddress);
    }
    std::optional<string> trashDate = fullEmails.back().email.trashDate ? 
    *fullEmails.back().email.trashDate : NULL;
    std::optional<string> unsendDate = fullEmails.back().email.unsendDate ? 
    *fullEmails.back().email.unsendDate : NULL;
    Thread thread = { labelIds, fullEmails.back().email.boundary, fullEmails.back().email.content, fullEmails.back().email.date, emailIds,
     fileTokens, fullEmails.back().from.email, DBUtils::joinSet(fromNames), fullEmails.back().email.id,
     fullEmails.back().email.key, fullEmails.back().email.date, fullEmails.back().email.messageId, fullEmails.back().email.preview,
     contactIds, fullEmails.back().email.replyTo, fullEmails.back().email.secure, fullEmails.back().email.status, 
     fullEmails.back().email.subject, threadId, trashDate, fullEmails.back().email.unread, 
     unsendDate };

     threads.push_back(thread);
  }

  cJSON *threadsJSONArray = cJSON_CreateArray();
  for(Thread &t: threads){
    cJSON_AddItemToArray(threadsJSONArray, t.toJSON());
  }
  string jsonString = cJSON_Print(threadsJSONArray);
  cJSON_Delete(threadsJSONArray);
  return jsonString;
}

cJSON* CriptextDB::getThreadsByLabel(string dbPath, vector<int> rejectedLabel, int labelId, string date, int limit, int accountId){
  std::cout << "CALLED GET_THREADS_BY_ID" << std::endl;
  vector<Thread> threads;
  
  vector<Email> emails = CriptextDB::getEmailsByLabelId(dbPath, rejectedLabel, labelId, date, limit, accountId);
  unordered_set<string> threadIds;
  std::transform(emails.cbegin(), emails.cend(), std::inserter(threadIds, threadIds.end()), [](Email email) -> string {
      return email.threadId;
  });
  std::cout << "GOT ALL THREAD IDS" << std::endl;
  for(const string threadId : threadIds){
    std::cout << "PROCESSING THREAD" << std::endl;
    vector<Email> threadEmails = CriptextDB::getEmailsByThreadId(dbPath, threadId, rejectedLabel, accountId);
    vector<string> fileTokens;
    unordered_set<string> fromNames;
    unordered_set<int> contactIds;
    vector<FullEmail> fullEmails;
    unordered_set<int> labelIds;
    vector<int> emailIds;
    for(const CriptextDB::Email &email : threadEmails){
      std::cout << "PROCESSING THREAD EMAILS" << std::endl;
      emailIds.push_back(email.id);
      vector<CRFile> files = CriptextDB::getFilesByEmailId(dbPath, email.id);
      vector<CriptextDB::EmailLabel> emailLabels = CriptextDB::getEmailLabelsByEmailId(dbPath, email.id);
      for(const CriptextDB::EmailLabel &emailLabel : emailLabels){
          labelIds.insert(emailLabel.labelId);
      }
      vector<int> vectorLabelIds;
      vectorLabelIds.insert(vectorLabelIds.end(), labelIds.begin(), labelIds.end());
      vector<Label> labels = CriptextDB::getLabelsByIds(dbPath, vectorLabelIds, accountId);
      vector<Contact> to = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "to");
      vector<Contact> cc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "cc");
      vector<Contact> bcc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "bcc");
      string fromEmail = DBUtils::getFromEmail(email.fromAddress);
      Contact from = CriptextDB::getContactByEmail(dbPath, fromEmail);

      FullEmail fullEmail = { email, labels, to, cc, bcc, from, files, email.preview };

      fullEmails.push_back(fullEmail);

      std::transform(to.cbegin(), to.cend(), std::inserter(contactIds, contactIds.end()), [](Contact contact) -> int {
        return contact.id;
      });
      std::transform(cc.cbegin(), cc.cend(), std::inserter(contactIds, contactIds.end()), [](Contact contact) -> int {
        return contact.id;
      });
      std::transform(bcc.cbegin(), bcc.cend(), std::inserter(contactIds, contactIds.end()), [](Contact contact) -> int {
        return contact.id;
      });
      std::transform(files.cbegin(), files.cend(), std::back_inserter(fileTokens), [](CRFile file) -> string {
        return file.token;
      });
      contactIds.insert(from.id);
      fromNames.insert(email.fromAddress);
    }
    std::cout << "TRY TO ADD THREAD" << std::endl;
    std::optional<string> trashDate = std::nullopt;
    if(fullEmails.back().email.trashDate.has_value()){
      trashDate = *fullEmails.back().email.trashDate;
    }
    std::cout << "GOT TRASH DATE" << std::endl;
    std::optional<string> unsendDate = std::nullopt;
    if(fullEmails.back().email.unsendDate.has_value()){
      trashDate = *fullEmails.back().email.unsendDate;
    }
    std::cout << "GOT UNSENT DATE" << std::endl;
    Thread thread = { labelIds, fullEmails.back().email.boundary, fullEmails.back().email.content, fullEmails.back().email.date, emailIds,
     fileTokens, fullEmails.back().from.email, DBUtils::joinSet(fromNames), fullEmails.back().email.id,
     fullEmails.back().email.key, fullEmails.back().email.date, fullEmails.back().email.messageId, fullEmails.back().email.preview,
     contactIds, fullEmails.back().email.replyTo, fullEmails.back().email.secure, fullEmails.back().email.status, 
     fullEmails.back().email.subject, threadId, trashDate, fullEmails.back().email.unread, 
     unsendDate };
    std::cout << "THREAD CREATED" << std::endl;

     threads.push_back(thread);
     std::cout << "THREAD ADDED" << std::endl;
  }
  std::cout << "CONSTRUCTING JSON RESPONSE" << std::endl;
  cJSON *threadsJSONArray = cJSON_CreateArray();
  for(Thread &t: threads){
    cJSON_AddItemToArray(threadsJSONArray, t.toJSON());
  }
  std::cout << "JSON RESPONSE: " << std::endl << cJSON_Print(threadsJSONArray) << std::endl << "JSON RESPONSE END" << std::endl;
  return threadsJSONArray;
}

cJSON* CriptextDB::getEmailsGroupByThreadByParams(string _dbPath, vector<int> _rejectedLabel, int _labelId, string _date, int _limit, int _accountId){
  std::cout << "CALLED GET_THREADS_BY_ID DESKTOP STYLE" << std::endl;
  auto t1 = std::chrono::high_resolution_clock::now();
  bool isRejectedLabel = std::find(_rejectedLabel.begin(), _rejectedLabel.end(), _labelId) != _rejectedLabel.end();
  string rejectedLabelIdsString = DBUtils::joinVector(_rejectedLabel);

  std::cout << "PREPARING QUERY" << std::endl;

  string labelSelectQuery;
  string labelWhereQuery;

  if (isRejectedLabel) {
    labelSelectQuery = "GROUP_CONCAT((SELECT GROUP_CONCAT(emailLabel \
    }.labelId) \
  FROM emailLabel WHERE emailLabel.emailId =  email.id \
  AND emailLabel.labelId NOT IN (" + rejectedLabelIdsString + "))) as allLabels,";
    labelWhereQuery = "WHERE emailLabel.labelId = " + to_string(_labelId);
  } else {
    labelSelectQuery = "GROUP_CONCAT(DISTINCT(emailLabel.labelId)) as allLabels,";
    labelWhereQuery = "WHERE NOT EXISTS (SELECT * FROM emailLabel \
    WHERE email.id = emailLabel.emailId \
    AND emailLabel.labelId IN (" + rejectedLabelIdsString + "))";
  }

  string contactQuery = "contact.id IS NOT NULL";

  string contactNameQuery;
  vector<string> contactTypes = { "from" };
  if (std::find(contactTypes.begin(), contactTypes.end(), "from") != contactTypes.end()) {
    contactNameQuery = "GROUP_CONCAT(DISTINCT(email.fromAddress)) as fromContactName,";
  } else {
    contactNameQuery = "GROUP_CONCAT(DISTINCT(contact.email)) as fromContactName,";
  }

  std::optional<string> emailContactOrQuery;
  if(1 < contactTypes.size()) {
    emailContactOrQuery = "OR emailContact.type = \'" + contactTypes[1] + "\'";
  } else { 
    emailContactOrQuery = std::nullopt;
  }

  string textQuery = "";

  // string query = "SELECT email.*, IFNULL(email.threadId, email.id) as uniqueId, " 
  //   + labelSelectQuery + "GROUP_CONCAT(DISTINCT(email.id)) as emailIds, \
  //   MAX(email.unread) as unread, \
  //   MAX(email.date) as maxDate from email \
  //   LEFT JOIN emailLabel ON email.id = emailLabel.emailId " 
  //   + labelWhereQuery + " AND email.date < date(\'now\') \
  //   GROUP BY uniqueId "
  //   + (_labelId > 0 ? ("HAVING allLabels LIKE \'%" + to_string(_labelId) + "%\'") : "") + " ORDER BY email.date DESC \
  //   LIMIT " + to_string(_limit) + ";";

  string query = "SELECT email.*, \
    IFNULL(email.threadId ,email.id) as uniqueId, \
    GROUP_CONCAT(DISTINCT(emailLabel.labelId)) as allLabels, \
    GROUP_CONCAT(DISTINCT(\'L\' || emailLabel.labelId)) as myAllLabels, \
    GROUP_CONCAT(DISTINCT(email.id)) as emailIds, \
    MAX(email.unread) as unread, \
    MAX(email.date) as maxDate \
    from email \
    JOIN emailLabel ON email.id = emailLabel.emailId \
    AND email.date < date(\'now\') \
    GROUP BY uniqueId \
    HAVING allLabels LIKE \'%" + to_string(_labelId) + "%\' \
    AND myAllLabels not like \'%2%\' and myAllLabels not like \'%L7%\' \
    ORDER BY email.date DESC \
    LIMIT " + to_string(_limit) + ";";

  std::cout << "QUERY: \n " << query << std::endl;

  vector<TempThread> tempThreads;

  sqlite_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
  database db(_dbPath, config);

  std::cout << "BEFORE EXEC QUERY" << std::endl;
  db << query
      >> [&] (int id, string key, string threadId, string s3Key, string subject, string content, string preview, 
                string date, int status, bool unread, bool secure, bool isMuted, std::optional<string> unsendDate,
                std::optional<string> trashDate, string messageId, std::optional<string> replyTo, string fromAddress,
                std::optional<string> boundary, string uniqueId, string allLabels, string myAllLabels, string emailIds, bool unread2, 
                string maxDate) {
                  std::cout << "PROCESSING THREAD" << std::endl;
                  std::cout << "PROCESSING EMAIL IDS: S: " << emailIds << std::endl;
                  vector<int> tmpIds = DBUtils::splitToVector(emailIds);
                  std::cout << "PROCESSING ALL LABELS" << std::endl;
                  unordered_set<int> tmpLabels = DBUtils::splitToSet(allLabels);
                  std::cout << "CREATING TEMP THREAD" << std::endl;
                  TempThread thread = { id, key, threadId, subject, content, preview, date, status, unread, secure,
                  unsendDate, trashDate, messageId, replyTo, fromAddress, boundary, tmpLabels, 
                  tmpIds, maxDate };
                  tempThreads.push_back(thread);
                };

  std::cout << "GOT ALL THREADS" << std::endl;
  std::cout << "GETTING ALL FILES" << std::endl;
  vector<Thread> threads;
  for(const TempThread &tmpThread : tempThreads){
    vector<string> fileTokensVector;
    db << "SELECT email.threadId, \
          GROUP_CONCAT(DISTINCT(file.token)) as fileTokens \
          FROM email \
          LEFT JOIN file ON email.id = file.emailId \
          WHERE email.id IN (" + DBUtils::joinVector(tmpThread.emailIds) + ") \
          GROUP BY email.threadId;"
        >> [&](string threadId, string fileTokens) {
          fileTokensVector = DBUtils::splitToStringVector(fileTokens);
        };
    unordered_set<int> recipientContactIds;
    string fromContactNames;
    db << "SELECT email.threadId," + contactNameQuery + " GROUP_CONCAT(DISTINCT(contact.id)) as recipientContactIds \
          FROM email \
          LEFT JOIN emailContact ON email.id = emailContact.emailId AND (emailContact.type = \'" 
          + contactTypes[0] + "\') \
          LEFT JOIN contact ON emailContact.contactId = contact.id \
          WHERE email.id IN (" + DBUtils::joinVector(tmpThread.emailIds) + ") \
          GROUP BY email.threadId;"
          >> [&](string threadId, string fromNames, string recipientIds){
            fromContactNames = fromNames;
            recipientContactIds = DBUtils::splitToSet(recipientIds);
          };
    Thread thread = CriptextDB::completeThread(tmpThread, fromContactNames, fileTokensVector, recipientContactIds);
    threads.push_back(thread);
  }

  std::cout << "CONSTRUCTING JSON RESPONSE" << std::endl;
  cJSON *threadsJSONArray = cJSON_CreateArray();
  for(Thread &t: threads){
    cJSON_AddItemToArray(threadsJSONArray, t.toJSON());
  }
  std::cout << "JSON RESPONSE: " << std::endl << cJSON_Print(threadsJSONArray) << std::endl << "JSON RESPONSE END" << std::endl;
  auto t2 = std::chrono::high_resolution_clock::now();
  auto duration = std::chrono::duration_cast<std::chrono::microseconds>( t2 - t1 ).count();
  std::cout << "TIME TO RESPOND WITH THREADS: " << duration << std::endl;
  return threadsJSONArray;
}

CriptextDB::Thread CriptextDB::completeThread(TempThread tmpThread, string fromNames, vector<string> tokens, unordered_set<int> recipientIds){
  Thread completeThread = {
      tmpThread.labelIds, tmpThread.boundary, tmpThread.lastEmailContent, tmpThread.date, tmpThread.emailIds, tokens,
      tmpThread.fromAddress, fromNames, tmpThread.lastEmailId, tmpThread.lastEmailKey, tmpThread.maxDate, tmpThread.messageId,
      tmpThread.preview, recipientIds ,tmpThread.replyTo, tmpThread.secure, tmpThread.status, tmpThread.subject, tmpThread.threadId,
      tmpThread.trashDate, tmpThread.unread, tmpThread.unsendDate
    };
    return completeThread;
}

