#include "Account.h"
#include <iostream>

using namespace std;

CriptextDB::Account CriptextDB::getAccount(string dbPath, int accountId) {
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "select * from account where id == ?");
  query.bind(1, accountId);

  query.executeStep();

  Account account = { query.getColumn(0).getInt(), query.getColumn(7).getString(), query.getColumn(8).getString(), query.getColumn(10).getInt() };
  return account;
}