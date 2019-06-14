#include "Account.h"
#include <iostream>

using namespace std;

CriptextDB::Account CriptextDB::getAccount(string dbPath, int accountId) {
  std::cout << "Get Account : " << accountId << std::endl;

  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "select * from account where id == ?");
  query.bind(1, accountId);

  query.executeStep();

  Account account = { query.getColumn(1).getInt(), query.getColumn(8).getString(), query.getColumn(9).getString(), query.getColumn(11).getInt() };
  return account;
}