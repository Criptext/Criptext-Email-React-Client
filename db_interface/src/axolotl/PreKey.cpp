#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct PreKey { 
    short int id;
    string privKey;
    string pubKey;
  }

  unique_ptr<PreKey> getPreKey(string dbPath, short int id, int accountId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'Select * from prekeyrecord where preKeyId == ? and accountId == ?')
      query.bind(1, id);
      query.bind(2, accountId)

      query.executeStep();
    } catch (exception& e) {
      return NULL;
    }

    PreKey preKey = { query.getColumn(1).getInt(), query.getColumn(2).getString(), query.getColumn(3).getString() }

    return preKey
  }

  bool createPreKey(string dbPath, short int id, string privKey, string pubKey, int accountId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'insert into prekey (preKeyId, preKeyPrivKey, preKeyPubKey, accountId) values (?,?,?,?)')
      query.bind(1, id);
      query.bind(2, privKey);
      query.bind(3, pubKey);
      query.bind(4, accountId);

      query.exec();
    } catch (exception& e) {
      return false
    }

    return true
  }

  bool deletePreKey(string dbPath, short int id, int accountId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'delete from prekeyrecord where preKeyId == ? and accountId == ?')
      query.bind(1, id);
      query.bind(2, accountId);

      query.exec();
    } catch (exception& e) {
      return false
    }

    return true
  }

} 