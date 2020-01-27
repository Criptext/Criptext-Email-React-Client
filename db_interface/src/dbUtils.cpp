#include "dbUtils.h"

database initializeDB(string dbPath, string password) {
  bool isEncrypted = dbPath.find("Encrypt.db") != string::npos;
  if (!isEncrypted) {
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    return database(dbPath, config);
  }
  sqlcipher_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::PRIVATECACH | OpenFlags::READWRITE;
  config.key = password;
  sqlcipher_database db(dbPath, config);
  db << "PRAGMA journal_mode = WAL";
  return std::move(db);
}