 #ifndef CONNECTION_H_
#define CONNECTION_H_

#include <SQLiteCpp/SQLiteCpp.h>

using namespace std;

class Connection {
  SQLite::Database db;
  public:
    Connection(char *path);
    ~Connection();
};

Connection::Connection(char *path) {
  db = SQLite::Database(path, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
}

Connection::~Connection() {
  
}


#endif