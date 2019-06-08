#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>

using namespace std;

namespace CriptextDB {

  struct SignedPreKey { 
    int id;
    string privKey;
    string pubKey;
  };

  SignedPreKey getSignedPreKey(string dbPath, short int id, int accountId) {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "Select * from signedprekeyrecord where signedPreKeyId == ? and accountId == ?");
    query.bind(1, id);
    query.bind(2, accountId);

    query.executeStep();

    SignedPreKey signedPreKey = { query.getColumn(1).getInt(), query.getColumn(2).getString(), query.getColumn(3).getString() };
    return signedPreKey;
  }

  bool createSignedPreKey(string dbPath, short int id, string privKey, string pubKey, int accountId) {
    try {
      SQLite::Database db(dbPath);

      SQLite::Statement query(db, "insert into signedprekey (signedPreKeyId, signedPreKeyPrivKey, signedPreKeyPubKey, accountId) values (?,?,?,?)");
      query.bind(1, id);
      query.bind(2, privKey);
      query.bind(3, pubKey);
      query.bind(4, accountId);

      query.exec();
    } catch (exception& e) {
      return false;
    }

    return true;
  }

  bool deleteSignedPreKey(string dbPath, short int id, int accountId) {
    try {
      SQLite::Database db(dbPath);

      SQLite::Statement query(db, "delete from signedPrekeyrecord where signedPreKeyId == ? and accountId == ?");
      query.bind(1, id);
      query.bind(2, accountId);

      query.exec();
    } catch (exception& e) {
      return false;
    }

    return true;
  }

} 