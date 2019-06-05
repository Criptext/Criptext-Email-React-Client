#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct SignedPreKey { 
    short int id;
    string privKey;
    string pubKey;
  }

  unique_ptr<SignedPreKey> getSignedPreKey(string dbPath, short int id, int accountId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'Select * from signedprekeyrecord where signedPreKeyId == ? and accountId == ?')
      query.bind(1, id);
      query.bind(2, accountId)

      query.executeStep();
    } catch (exception& e) {
      return NULL;
    }

    SignedPreKey signedPreKey = { query.getColumn(1).getInt(), query.getColumn(2).c_str(), query.getColumn(3).c_str() }

    return signedPreKey
  }

  bool createSignedPreKey(string dbPath, short int id, string privKey, string pubKey, int accountId) {
    try {
      SQLITE::Database db(dbPath);

      SQLITE::Statement query(db, 'insert into signedprekey (signedPreKeyId, signedPreKeyPrivKey, signedPreKeyPubKey, accountId) values (?,?,?,?)')
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

      SQLITE::Statement query(db, 'delete from signedPrekeyrecord where signedPreKeyId == ? and accountId == ?')
      query.bind(1, id);
      query.bind(2, accountId);

      query.exec();
    } catch (exception& e) {
      return false
    }

    return true
  }

} 