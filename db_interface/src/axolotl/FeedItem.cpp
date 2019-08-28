#include "FeedItem.h"
#include "DBUtils.h"
#include <iostream>

using namespace std;

int createFeedItem(string dbPath, time_t date, int type, bool seen, int emailId, int contactId, int fileId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "insert into feeditem (date, type, seen, emailId, contactId, fileId) values (?,?,?,?,?,?)");
  query.bind(1, CriptextDB::DBUtils::getDateForDBSaving(date));
  query.bind(2, type);
  query.bind(3, seen);
  query.bind(4, emailId);
  query.bind(5, contactId);
  query.bind(6, fileId);
  return query.exec();
}

int deleteFeedItemById(string dbPath, int feedId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from feeditem where id == ?");
  query.bind(1, feedId);
  return query.exec();
}

vector<CriptextDB::FeedItem> getAllFeedItems(string dbPath){
  vector<CriptextDB::FeedItem> allFeedItems;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "select * from feeditem");

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        time_t date = CriptextDB::DBUtils::getTimeFromDB(query.getColumn(1).getText());
        int type = query.getColumn(2).getInt();
        bool seen = query.getColumn(4).getInt();
        int emailId = query.getColumn(5).getInt();
        int contactId = query.getColumn(6).getInt();
        int fileId = query.getColumn(7).getInt();

        CriptextDB::FeedItem file = { id, date, type, seen, emailId, contactId, fileId };
        
        allFeedItems.push_back(file);
    }
    return allFeedItems;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allFeedItems;
  }
}

int getFeedItemsCounterBySeen(string dbPath){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "select count(distinct id) from feeditem where seen == 0");
  query.executeStep();
  return query.getColumn(0).getInt();
}

int updateFeedItems(string dbPath, vector<int> feedIds){
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    int count = 0;
    for (auto &feedId : feedIds) // access by reference to avoid copying
    {  
      SQLite::Statement query(db, "update feeditem set seen = 1 where id == ?");
      query.bind(1, feedId);
      count += query.exec();
    }
    return count;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return -1;
  }
}
