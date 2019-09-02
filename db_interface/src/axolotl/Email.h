#ifndef EMAIL_H_
#define EMAIL_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct Email {
    int id;
    string key;
    string threadId;
    string subject;
    string content;
    string preview;
    time_t date;
    int status;
    bool unread;
    bool secure;
    optional<time_t> unsendDate;
    optional<time_t> trashDate;
    string messageId;
    string fromAddress;
    optional<string> replyTo;
    optional<string> boundary;
    int accountId;
  };
  
  int createEmail(string dbPath, string key, string threadId, string subject, string preview, time_t date, int status, bool unread, bool secure, optional<time_t> unsendDate, optional<time_t> trashDate, string messageId, string fromAddress, optional<string> replyTo, optional<string> boundary, int accountId);
  int deleteEmailByKey(string dbPath, string key, int accountId);
  int deleteEmailById(string dbPath, int emailId, int accountId);
  int deleteEmailsById(string dbPath, vector<int> emailIds, int accountId);
  int deleteEmailsByThreadIdAndEmailId(string dbPath, vector<int> threadIds, int labelId, int accountId);
  vector<Email> getTrashExpiredEmails(string dbPath, int accountId);
  Email getEmailByKey(string dbPath, string key, int accountId);
  vector<Email> getEmailsByIds(string dbPath, vector<int> emailIds, int accountId);
  vector<Email> getEmailsByThreadIds(string dbPath, vector<string> threadIds, int labelId, string date, int limit, int accountId);
  vector<Email> getEmailsByLabelId(string dbPath, int labelId, string date, int limit, int accountId);
} 

#endif