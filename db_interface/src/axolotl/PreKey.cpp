#include <SQLiteCpp/SQLiteCpp.h>
#include <string>

using namespace std;

namespace CriptextDB {

  struct PreKey { 
    int id;
    string privKey;
    string pubKey;
  };

  PreKey getPreKey(string dbPath, short int id, int accountId) {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "Select * from prekeyrecord where preKeyId == ? and accountId == ?");
    query.bind(1, id);
    query.bind(2, accountId);

    query.executeStep();
    PreKey preKey = { query.getColumn(1).getInt(), query.getColumn(2).getString(), query.getColumn(3).getString() };
    return preKey;
  }

  bool createPreKey(string dbPath, short int id, string privKey, string pubKey, int accountId) {
    try {
      SQLite::Database db(dbPath);

      SQLite::Statement query(db, "insert into prekey (preKeyId, preKeyPrivKey, preKeyPubKey, accountId) values (?,?,?,?)");
      query.bind(1, id);
      query.bind(2, privKey);
      query.bind(3, pubKey);
      query.bind(4, accountId);

      query.exec();
      return true;
    } catch (exception& e) {
      return false;
    }
  }

  bool deletePreKey(string dbPath, short int id, int accountId) {
    try {
      SQLite::Database db(dbPath);

      SQLite::Statement query(db, "delete from prekeyrecord where preKeyId == ? and accountId == ?");
      query.bind(1, id);
      query.bind(2, accountId);

      query.exec();
      return true;
    } catch (exception& e) {
      return false;
    }
  }

} 