#include "Thread.h"
#include "FullEmail.h"
#include "EmailLabel.h"
#include "EmailContact.h"
#include <unordered_set>

using namespace std;

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
<<<<<<< HEAD
      return fullEmail.email.id;
=======
      std::unordered_set<int> labelIds;
      vector<string> fileTokens;
      unordered_set<string> fromNames;
      unordered_set<int> contactIds;
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
        return fullEmail.email.id;
>>>>>>> compiling in linux
    });
    for(FullEmail &fullEmail : fullEmails) {
      std::transform(fullEmail.labels.cbegin(), fullEmail.labels.cend(), std::inserter(labelIds, labelIds.cend()), [](Label label) -> int {
        return label.id;
      });
      std::transform(fullEmail.files.cbegin(), fullEmail.files.cend(), std::back_inserter(fileTokens), [](CRFile file) -> string {
        return file.token;
      });
      std::transform(fullEmail.to.cbegin(), fullEmail.to.cend(), std::inserter(contactIds, contactIds.cend()), [](Contact contact) -> int {
        return contact.id;
      });
      std::transform(fullEmail.cc.cbegin(), fullEmail.cc.cend(), std::inserter(contactIds, contactIds.cend()), [](Contact contact) -> int {
        return contact.id;
      });
      std::transform(fullEmail.bcc.cbegin(), fullEmail.bcc.cend(), std::inserter(contactIds, contactIds.cend()), [](Contact contact) -> int {
        return contact.id;
      });
      contactIds.insert(fullEmail.from.id);
      fromNames.insert(fullEmail.email.fromAddress);
    }
    optional<string> trashDate = fullEmails.back().email.trashDate ? 
    DBUtils::getDateForDBSaving(*fullEmails.back().email.trashDate) : NULL;
    optional<string> unsendDate = fullEmails.back().email.unsendDate ? 
    DBUtils::getDateForDBSaving(*fullEmails.back().email.unsendDate) : NULL;
    Thread thread = { labelIds, fullEmails.back().email.boundary, fullEmails.back().email.content, DBUtils::getDateForDBSaving(fullEmails.back().email.date), emailIds,
     fileTokens, fullEmails.back().from.email, DBUtils::joinSet(fromNames), fullEmails.back().email.id,
     fullEmails.back().email.key, DBUtils::getDateForDBSaving(fullEmails.back().email.date), fullEmails.back().email.messageId, fullEmails.back().email.preview,
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
  vector<Thread> threads;
  
  vector<Email> emails = CriptextDB::getEmailsByLabelId(dbPath, rejectedLabel, labelId, date, limit, accountId);
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
  optional<string> trashDate = fullEmails.back().email.trashDate ? 
  DBUtils::getDateForDBSaving(*fullEmails.back().email.trashDate) : NULL;
  optional<string> unsendDate = fullEmails.back().email.unsendDate ? 
  DBUtils::getDateForDBSaving(*fullEmails.back().email.unsendDate) : NULL;
  Thread thread = { labelIds, fullEmails.back().email.boundary, fullEmails.back().email.content, DBUtils::getDateForDBSaving(fullEmails.back().email.date), emailIds,
    fileTokens, fullEmails.back().from.email, DBUtils::joinSet(fromNames), fullEmails.back().email.id,
    fullEmails.back().email.key, DBUtils::getDateForDBSaving(fullEmails.back().email.date), fullEmails.back().email.messageId, fullEmails.back().email.preview,
    contactIds, fullEmails.back().email.replyTo, fullEmails.back().email.secure, fullEmails.back().email.status, 
    fullEmails.back().email.subject, fullEmails.back().email.threadId, trashDate, fullEmails.back().email.unread, 
    unsendDate };

    threads.push_back(thread);
  

  cJSON *threadsJSONArray = cJSON_CreateArray();
  for(Thread &t: threads){
    cJSON_AddItemToArray(threadsJSONArray, t.toJSON());
  }
  return threadsJSONArray;
}

