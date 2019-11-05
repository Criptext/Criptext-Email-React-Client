#ifndef SESSIONRECORD_H_
#define SESSIONRECORD_H_

#include <string>
#include <cstring>
#include <vector>
#include <stdexcept>
#include <sqlite_modern_cpp/sqlcipher.h>
#include <iostream>
#include "../dbUtils.h"

using namespace std;

namespace CriptextDB {

  struct SessionRecord {
    string recipientId;
    long int deviceId;
    string record;
    size_t len;
  };

  SessionRecord getSessionRecord(string dbPath, string password, string recipientId, long int deviceId);
  vector<SessionRecord> getSessionRecords(string dbPath, string password, string recipientId);
  bool createSessionRecord(string dbPath, string password, string recipientId, long int deviceId, char* record, size_t len);
  bool deleteSessionRecord(string dbPath, string password, string recipientId, long int deviceId);
  bool deleteSessionRecords(string dbPath, string password, string recipientId);
} 

#endif