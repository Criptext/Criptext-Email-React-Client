#ifndef PENDING_EVENT_H_
#define PENDING_EVENT_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct PendingEvent {
    int id;
    string data;
    int accountId;
  };

  int createPendingEvent(string dbPath, string data, int accountId);
  vector<PendingEvent> getPendingEvents(string dbPath, int accountId);
  int deletePendingEventsByIds(string dbPath, vector<int> pendingEventIds);
} 

#endif