#include "dbUtils.h"

database initializeDB(string dbPath, string password) {
  if (password.empty()) {
    sqlite_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    return database(dbPath, config);
  }
  std::cout << "DBPATH = " << dbPath << " | PASS : " << password << std::endl;
  sqlcipher_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::PRIVATECACH | OpenFlags::READWRITE;
  config.key = password;
  return sqlcipher_database(dbPath, config);
}