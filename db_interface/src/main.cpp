#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct Account {
    int id;
    string privKey;
    string pubKey;
    int registrationId;
  }

  unique_ptr<Account> getAccount(int accountId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'select * from account where accountId == ?')
      query.bind(1, accountId);

      query.executeStep();
    } catch (exception& e) {
      return NULL;
    }

    Account account = { query.getColumn(1).getInt(), query.getColumn(8).getString(), query.getColumn(9).getString(), query.getColumn(10).getInt() }

    return account
  }
} 