#include "PendingEvent.h"
#include "DBUtils.h"
#include <iostream>

using namespace std;

int createPendingEvent(string dbPath, string data, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "insert into peerevent (data, accountId) values (?,?)");
  query.bind(1, data);
  query.bind(2, accountId);
  return query.exec();
}

vector<CriptextDB::PendingEvent> getPendingEvents(string dbPath, int accountId){
  vector<CriptextDB::PendingEvent> allPendingEvents;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "select * from pendingEvent where accountId == ?");
    query.bind(1, accountId);

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        string data = query.getColumn(1).getText();
        int accountId = query.getColumn(2).getInt();

        CriptextDB::PendingEvent pendingEvent = { id, data, accountId };
        
        allPendingEvents.push_back(pendingEvent);
    }
    return allPendingEvents;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allPendingEvents;
  }
}

int deletePendingEventsByIds(string dbPath, vector<int> pendingEventIds){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from pendingEvent where id in (" + DBUtils::joinVector(pendingEventIds) + ")");

  return query.exec();
}