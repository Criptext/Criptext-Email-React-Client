#ifndef CRFILE_H_
#define CRFILE_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct CRFile {
    int id;
    string token;
    string name;
    int size;
    int status;
    time_t date;
    string mimeType;
    optional<string> key;
    optional<string> iv;
    optional<string> cid;
    int emailId;
  };

  int createFile(string dbPath, string token, string name, int size, int status, time_t date, string mimeType, optional<string> key, optional<string> iv, optional<string> cid, int emailId);
  vector<CRFile> getFilesByEmailId(string dbPath, int emailId);
  vector<CRFile> getFilesByToken(string dbPath, vector<string> tokens);
  int updateFilesByEmailId(string dbPath, int newStatus, int emailId);
} 

#endif