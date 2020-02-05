#ifndef DBUTILS_H_
#define DBUTILS_H_

#include <sqlite_modern_cpp/sqlcipher.h>
#include <sqlite_modern_cpp.h>
#include <string>

using namespace std;
using namespace sqlite;

database initializeDB(string dbPath, string password);

#endif