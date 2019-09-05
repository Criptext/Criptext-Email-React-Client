#include "Email.h"
#include "Label.h"
#include "DBUtils.h"
#include <iostream>

using namespace std;

int CriptextDB::createEmail(string dbPath, string key, string threadId, string subject, string preview, time_t date, int status, bool unread, bool secure, optional<time_t> unsendDate, optional<time_t> trashDate, string messageId, string fromAddress, optional<string> replyTo, optional<string> boundary, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "insert into email (key, threadId, subject, preview, date, status, unread, secure, unsendDate, trashDate, messageId, fromAddress, replyTo, boundary, accountId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  query.bind(1, key);
  query.bind(2, threadId);
  query.bind(3, subject);
  query.bind(4, preview);
  query.bind(5, DBUtils::getDateForDBSaving(date));
  query.bind(6, status);
  query.bind(7, unread);
  query.bind(8, secure);
  query.bind(9, unsendDate ? DBUtils::getDateForDBSaving(*unsendDate) : "NULL");
  query.bind(10, trashDate ? DBUtils::getDateForDBSaving(*trashDate) : "NULL");
  query.bind(11, messageId);
  query.bind(12, fromAddress);
  query.bind(13, replyTo ? *replyTo : "NULL");
  query.bind(14, boundary ? *boundary : "NULL");
  query.bind(15, accountId);
  return query.exec();
}

int CriptextDB::deleteEmailByKey(string dbPath, string key, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from email where key == ? and accountId == ?");
  query.bind(1, key);
  query.bind(2, accountId);
  return query.exec();
}

int CriptextDB::deleteEmailById(string dbPath, int emailId, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from email where emailId == ? and accountId == ?");
  query.bind(1, emailId);
  query.bind(2, accountId);
  return query.exec();
}

int CriptextDB::deleteEmailsById(string dbPath, vector<int> emailIds, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from email where accountId == ? and key in (" + DBUtils::joinVector(emailIds) + ")");
  query.bind(1, accountId);
  return query.exec();
}

int CriptextDB::deleteEmailsByThreadIdAndEmailId(string dbPath, vector<int> threadIds, int labelId, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from email where accountId == ? and threadId in (" + DBUtils::joinVector(threadIds) + ") and exists (select * from emailLabel where emailId == email.id and labelId == ?)");
  query.bind(1, accountId);
  query.bind(2, labelId);
  return query.exec();
}

vector<CriptextDB::Email> CriptextDB::getTrashExpiredEmails(string dbPath, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "SELECT DISTINCT emailId FROM email " 
            "left join emailLabel on email.id = emailLabel.emailId " 
            "where emailLabel.labelId == ? AND email.accountId == ? "
            "AND (julianday('now') - julianday(email.trashDate)) >= 30");
  query.bind(1, CriptextDB::TRASH.id);
  query.bind(2, accountId);

  vector<int> allIds;
  while(query.executeStep()){
    allIds.push_back(query.getColumn(0).getInt());
  }

  return CriptextDB::getEmailsByIds(dbPath, allIds, accountId);
}

CriptextDB::Email CriptextDB::getEmailByKey(string dbPath, string key, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "select * from email where key == ? and accounId == ?");
  query.bind(1, key);
  query.bind(2, accountId);
  query.executeStep();

  int id = query.getColumn(0).getInt();
  string metadataKey = query.getColumn(1).getString();
  string threadId = query.getColumn(2).getString();
  string subject = query.getColumn(4).getString();
  string content = query.getColumn(5).getString();
  string preview = query.getColumn(6).getString();
  time_t date = DBUtils::getTimeFromDB(query.getColumn(7).getString());
  int status = query.getColumn(8).getInt();
  bool unread = query.getColumn(9).getInt();
  bool secure = query.getColumn(10).getInt();
  optional<time_t> unsendDate; 
  if(query.getColumn(12).isNull()) 
    unsendDate = nullopt;
  else 
    unsendDate = DBUtils::getTimeFromDB(query.getColumn(12).getString());
  optional<time_t> trashDate; 
  if(query.getColumn(13).isNull()) 
    trashDate = nullopt;
  else 
    trashDate = DBUtils::getTimeFromDB(query.getColumn(13).getString());
  string messageId = query.getColumn(14).getString();
  string fromAddress = query.getColumn(15).getString();
  optional<string> replyTo; 
  if(query.getColumn(16).isNull()) 
    replyTo = nullopt;
  else 
    replyTo = query.getColumn(16).getString();
  optional<string> boundary; 
  if(query.getColumn(17).isNull()) 
    boundary = nullopt;
  else 
    boundary = query.getColumn(17).getString();
  int account_id = query.getColumn(18).getInt();

  CriptextDB::Email email = { id, metadataKey, threadId, subject, content, preview, date, status, unread, secure, unsendDate, trashDate, messageId, fromAddress, replyTo, boundary, account_id };

  return email;
}

vector<CriptextDB::Email> CriptextDB::getEmailsByIds(string dbPath, vector<int> emailIds, int accountId){
  vector<CriptextDB::Email> allEmails;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "select * from email where accountId == ? and id in (" + DBUtils::joinVector(emailIds) + ")");
    query.bind(1, accountId);

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        string key = query.getColumn(1).getString();
        string threadId = query.getColumn(2).getString();
        string subject = query.getColumn(4).getString();
        string content = query.getColumn(5).getString();
        string preview = query.getColumn(6).getString();
        time_t date = DBUtils::getTimeFromDB(query.getColumn(7).getString());
        int status = query.getColumn(8).getInt();
        bool unread = query.getColumn(9).getInt();
        bool secure = query.getColumn(10).getInt();
        optional<time_t> unsendDate; 
        if(query.getColumn(12).isNull()) 
          unsendDate = nullopt;
        else 
          unsendDate = DBUtils::getTimeFromDB(query.getColumn(12).getString());
        optional<time_t> trashDate; 
        if(query.getColumn(13).isNull()) 
          trashDate = nullopt;
        else 
          trashDate = DBUtils::getTimeFromDB(query.getColumn(13).getString());
        string messageId = query.getColumn(14).getString();
        string fromAddress = query.getColumn(15).getString();
        optional<string> replyTo; 
        if(query.getColumn(16).isNull()) 
          replyTo = nullopt;
        else 
          replyTo = query.getColumn(16).getString();
        optional<string> boundary; 
        if(query.getColumn(17).isNull()) 
          boundary = nullopt;
        else 
          boundary = query.getColumn(17).getString();
        int accountId = query.getColumn(18).getInt();

        CriptextDB::Email email = { id, key, threadId, subject, content, preview, date, status, unread, secure, unsendDate, trashDate, messageId, fromAddress, replyTo, boundary, accountId };
        
        allEmails.push_back(email);
    }
    return allEmails;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allEmails;
  }
}

vector<CriptextDB::Email> CriptextDB::getEmailsByThreadId(string dbPath, string threadId, vector<int> rejectedLabels, int accountId){
  vector<CriptextDB::Email> allEmails;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "SELECT email.* FROM email "
            "left join email_label on email.id = email_label.emailId "
            "WHERE threadId == ? "
            "AND NOT EXISTS "
            "(SELECT * FROM email_label WHERE email_label.emailId = email.id and email_label.labelId IN ("+ DBUtils::joinVector(rejectedLabels) +")) "
            "GROUP BY email.messageId,email.threadId "
            "ORDER BY date ASC");
    query.bind(1, threadId);

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        string key = query.getColumn(1).getString();
        string threadId = query.getColumn(2).getString();
        string subject = query.getColumn(4).getString();
        string content = query.getColumn(5).getString();
        string preview = query.getColumn(6).getString();
        time_t date = DBUtils::getTimeFromDB(query.getColumn(7).getString());
        int status = query.getColumn(8).getInt();
        bool unread = query.getColumn(9).getInt();
        bool secure = query.getColumn(10).getInt();
        optional<time_t> unsendDate; 
        if(query.getColumn(12).isNull()) 
          unsendDate = nullopt;
        else 
          unsendDate = DBUtils::getTimeFromDB(query.getColumn(12).getString());
        optional<time_t> trashDate; 
        if(query.getColumn(13).isNull()) 
          trashDate = nullopt;
        else 
          trashDate = DBUtils::getTimeFromDB(query.getColumn(13).getString());
        string messageId = query.getColumn(14).getString();
        string fromAddress = query.getColumn(15).getString();
        optional<string> replyTo; 
        if(query.getColumn(16).isNull()) 
          replyTo = nullopt;
        else 
          replyTo = query.getColumn(16).getString();
        optional<string> boundary; 
        if(query.getColumn(17).isNull()) 
          boundary = nullopt;
        else 
          boundary = query.getColumn(17).getString();
        int accountId = query.getColumn(18).getInt();

        CriptextDB::Email email = { id, key, threadId, subject, content, preview, date, status, unread, secure, unsendDate, trashDate, messageId, fromAddress, replyTo, boundary, accountId };
        
        allEmails.push_back(email);
    }
    return allEmails;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allEmails;
  }
}

vector<CriptextDB::Email> CriptextDB::getEmailsByThreadIds(string dbPath, vector<string> threadIds, int labelId, string date, int limit, int accountId){
  vector<CriptextDB::Email> allEmails;
  vector<int> recjectedLabelIds { CriptextDB::SPAM.id, CriptextDB::TRASH.id };
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "select email.*, "
        "max(email.unread) as unread, max(email.date) as date "
        "from email "
        "left join emailLabel on email.id = emailLabel.emailId "
        "and date < ? "
        "where case when ? "
        "then emailLabel.labelId = (select id from label where label.id= cast(trim(trim(?, '%'), 'L') as integer)) "
        "else not exists "
        "(select * from emailLabel where emailLabel.emailId = email.id and emailLabel.labelId in (" + DBUtils::joinVector(recjectedLabelIds) + ")) "
        "end "
        "AND accountId = ? "
        "group by (CASE WHEN email.threadId = \"\" THEN email.id ELSE email.threadId END) "
        "having coalesce(group_concat('L' || emailLabel.labelId), \"\") like ? "
        "order by date DESC limit ?");
    query.bind(1, date);
    query.bind(2, (labelId == CriptextDB::SPAM.id || labelId == CriptextDB::TRASH.id));
    query.bind(3, labelId > 0 ? ("%" + to_string(labelId) + "%") : "");
    query.bind(4, accountId);
    query.bind(5, labelId > 0 ? ("%" + to_string(labelId) + "%") : "");
    query.bind(6, limit);

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        string key = query.getColumn(1).getString();
        string threadId = query.getColumn(2).getString();
        string subject = query.getColumn(4).getString();
        string content = query.getColumn(5).getString();
        string preview = query.getColumn(6).getString();
        time_t date = DBUtils::getTimeFromDB(query.getColumn(7).getString());
        int status = query.getColumn(8).getInt();
        bool unread = query.getColumn(9).getInt();
        bool secure = query.getColumn(10).getInt();
        optional<time_t> unsendDate; 
        if(query.getColumn(12).isNull()) 
          unsendDate = nullopt;
        else 
          unsendDate = DBUtils::getTimeFromDB(query.getColumn(12).getString());
        optional<time_t> trashDate; 
        if(query.getColumn(13).isNull()) 
          trashDate = nullopt;
        else 
          trashDate = DBUtils::getTimeFromDB(query.getColumn(13).getString());
        string messageId = query.getColumn(14).getString();
        string fromAddress = query.getColumn(15).getString();
        optional<string> replyTo; 
        if(query.getColumn(16).isNull()) 
          replyTo = nullopt;
        else 
          replyTo = query.getColumn(16).getString();
        optional<string> boundary; 
        if(query.getColumn(17).isNull()) 
          boundary = nullopt;
        else 
          boundary = query.getColumn(17).getString();
        int accountId = query.getColumn(18).getInt();

        CriptextDB::Email email = { id, key, threadId, subject, content, preview, date, status, unread, secure, unsendDate, trashDate, messageId, fromAddress, replyTo, boundary, accountId };
        
        allEmails.push_back(email);
    }
    return allEmails;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allEmails;
  }
}

vector<CriptextDB::Email> CriptextDB::getEmailsByLabelId(string dbPath, vector<int> rejectedLabels, int labelId, string date, int limit, int accountId){
  vector<CriptextDB::Email> allEmails;
  vector<int> recjectedLabelIds { CriptextDB::SPAM.id, CriptextDB::TRASH.id };
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    string myRejectedLabels = DBUtils::joinVector(recjectedLabelIds);
    std::cout << myRejectedLabels << std::endl;
    SQLite::Statement query(db, "select email.*, "
        "max(email.unread) as unread, max(email.date) as date "
        "from email "
        "left join emailLabel on email.id = emailLabel.emailId "
        "and date < ? "
        "where case when ? "
        "then emailLabel.labelId = (select id from label where label.id= cast(trim(trim(?, '%'), 'L') as integer)) "
        "else not exists "
        "(select * from emailLabel where emailLabel.emailId = email.id and emailLabel.labelId in (" + myRejectedLabels + ")) "
        "end "
        "group by (CASE WHEN email.threadId = \"\" THEN email.id ELSE email.threadId END) "
        "having coalesce(group_concat('L' || emailLabel.labelId), \"\") like ? "
        "order by date DESC limit ?");
    query.bind(1, date);
    std::cout << 1 << std::endl;
    query.bind(2, (labelId == CriptextDB::SPAM.id || labelId == CriptextDB::TRASH.id));
    std::cout << 2 << std::endl;
    query.bind(3, labelId > 0 ? ("%L" + to_string(labelId) + "%") : "");
    std::cout << 3 << std::endl;
    query.bind(4, labelId > 0 ? ("%L" + to_string(labelId) + "%") : "");
    std::cout << 4 << std::endl;
    query.bind(5, limit);
    std::cout << query.getExpandedSQL() << std::endl;
    while (query.executeStep())
    {
        std::cout << 6 << std::endl;
        int id = query.getColumn(0).getInt();
        string key = query.getColumn(1).getString();
        string threadId = query.getColumn(2).getString();
        string subject = query.getColumn(4).getString();
        string content = query.getColumn(5).getString();
        string preview = query.getColumn(6).getString();
        time_t date = DBUtils::getTimeFromDB(query.getColumn(7).getString());
        int status = query.getColumn(8).getInt();
        bool unread = query.getColumn(9).getInt();
        bool secure = query.getColumn(10).getInt();
        optional<time_t> unsendDate; 
        if(query.getColumn(12).isNull()) 
          unsendDate = nullopt;
        else 
          unsendDate = DBUtils::getTimeFromDB(query.getColumn(12).getString());
        optional<time_t> trashDate; 
        if(query.getColumn(13).isNull()) 
          trashDate = nullopt;
        else 
          trashDate = DBUtils::getTimeFromDB(query.getColumn(13).getString());
        string messageId = query.getColumn(14).getString();
        string fromAddress = query.getColumn(15).getString();
        optional<string> replyTo; 
        if(query.getColumn(16).isNull()) 
          replyTo = nullopt;
        else 
          replyTo = query.getColumn(16).getString();
        optional<string> boundary; 
        if(query.getColumn(17).isNull()) 
          boundary = nullopt;
        else 
          boundary = query.getColumn(17).getString();

        CriptextDB::Email email = { id, key, threadId, subject, content, preview, date, status, unread, secure, unsendDate, trashDate, messageId, fromAddress, replyTo, boundary, accountId };
        
        allEmails.push_back(email);
        std::cout << 7 << std::endl;
    }
    std::cout << 8 << std::endl;
    return allEmails;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allEmails;
  }
}
