#ifndef SETTINGS_H_
#define SETTINGS_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct AppSettings {
    char* privKey;
    char* pubKey;
    int registrationId;
  };

  AppSettings getSettings(string dbPath, char* recipientId);
  int createAccountSettings(string dbPath, char* recipientId, char* name, int deviceId, char* pubKey, char* privKey, int registrationId);
  int updateAccountSettings(string dbPath, char* recipientId, char* jwt, char* name, char* signature, bool signatureEnabled);
} 

#endif