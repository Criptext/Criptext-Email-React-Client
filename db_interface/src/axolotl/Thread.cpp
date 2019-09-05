#include "Thread.h"
#include "FullEmail.h"
#include "EmailLabel.h"
#include "EmailContact.h"
#include <unordered_set>
#include <iostream>
#include <optional>

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
    *fullEmails.back().email.trashDate : NULL;
    optional<string> unsendDate = fullEmails.back().email.unsendDate ? 
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
      string fromEmail = email.fromAddress;
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
      fromNames.insert(fromEmail);
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

