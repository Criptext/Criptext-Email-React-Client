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
    char *record;
    size_t len;
  };

  SessionRecord getSessionRecord(string dbPath, string recipientId, long int deviceId);
  vector<SessionRecord> getSessionRecords(string dbPath, string recipientId);
  bool createSessionRecord(string dbPath, string recipientId, long int deviceId, char* record, size_t len);
  bool deleteSessionRecord(string dbPath, string recipientId, long int deviceId);
  bool deleteSessionRecords(string dbPath, string recipientId);
} 

#endif