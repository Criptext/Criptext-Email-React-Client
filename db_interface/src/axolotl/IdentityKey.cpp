#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct IdentityKey { 
    string recipientId;
    long int deviceId;
    string identityKey;
  }

  unique_ptr<IdentityKey> getIdentityKey(string dbPath, string recipientId, long int deviceId, int accountId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'Select * from identitykeyrecord where recipientId == ? and deviceId == ? and accountId == ?')
      query.bind(1, recipientId);
      query.bind(2, deviceId)
      query.bind(3, accountId)

      query.executeStep();
    } catch (exception& e) {
      return NULL;
    }

    IdentityKey identityKey = { query.getColumn(1).c_str(), query.getColumn(2).getInt(), query.getColumn(3).c_str() }

    return identityKey
  }

  bool createIdentityKey(string dbPath, string recipientId, int deviceId, string identityKey, int accountId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'insert into identitykeyrecord (recipientId, deviceId, identityKey, accountId) values (?,?,?,?)')
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, identityKey);
      query.bind(4, accountId);

      query.exec();
    } catch (exception& e) {
      return false
    }

    return true
  }

} 