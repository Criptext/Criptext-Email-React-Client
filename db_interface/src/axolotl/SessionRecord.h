#ifndef SESSIONRECORD_H_
#define SESSIONRECORD_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct SessionRecord {
    string recipientId;
    long int deviceId;
    string record;
  };

  SessionRecord getSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId);
  vector<SessionRecord> getSessionRecords(string dbPath, int accountId, string recipientId);
  bool createSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId, string record);
  bool deleteSessionRecord(string dbPath, int accountId, string recipientId, long int deviceId);
  bool deleteSessionRecords(string dbPath, int accountId, string recipientId);
} 

#endif