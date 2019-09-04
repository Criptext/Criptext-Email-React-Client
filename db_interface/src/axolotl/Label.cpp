#include "Label.h"
#include "DBUtils.h"
#include <iostream>

using namespace std;

int createLabel(string dbPath, string text, string color, string type, bool visible, string uuid, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "insert into label (text, color, type, visible, uuid, accountId) values (?,?,?,?,?,?)");
  query.bind(1, text);
  query.bind(2, color);
  query.bind(3, type);
  query.bind(4, visible);
  query.bind(5, uuid);
  query.bind(6, accountId);
  return query.exec();
}

int deleteLabelById(string dbPath, int labelId, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "delete from label where labelId == ? and accountId == ?");
  query.bind(1, labelId);
  query.bind(2, accountId);
  return query.exec();
}

vector<CriptextDB::Label> getAllLabels(string dbPath, int accountId){
  vector<CriptextDB::Label> allLabels;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);

    SQLite::Statement query(db, "select * from feeditem");

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        string text = query.getColumn(1).getText();
        string color = query.getColumn(2).getText();
        string type = query.getColumn(3).getText();
        bool visible = query.getColumn(4).getInt();
        string uuid = query.getColumn(5).getText();
        int accountId = query.getColumn(6).getInt();

        CriptextDB::Label label = { id, text, color, type, visible, uuid, accountId };
        
        allLabels.push_back(label);
    }
    return allLabels;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allLabels;
  }
}

CriptextDB::Label getLabelById(string dbPath, int labelId, int accountId){
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "select * from label where id == ? and accountId == ?");
  query.bind(1, labelId);
  query.bind(2, accountId);

  query.executeStep();

  int id = query.getColumn(0).getInt();
  string text = query.getColumn(1).getText();
  string color = query.getColumn(2).getText();
  string type = query.getColumn(3).getText();
  bool visible = query.getColumn(4).getInt();
  string uuid = query.getColumn(5).getText();
  int account_id = query.getColumn(6).getInt();

  CriptextDB::Label label = { id, text, color, type, visible, uuid, account_id };

  return label;
}

vector<CriptextDB::Label> CriptextDB::getLabelsByIds(string dbPath, vector<int> labelIds, int accountId){
  vector<CriptextDB::Label> allLabels;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "select * from label where id in (" + DBUtils::joinVector(labelIds) + ") and (accountId is null OR accountId == ?)");
    query.bind(1, accountId);

    query.executeStep();

    int id = query.getColumn(0).getInt();
    string text = query.getColumn(1).getText();
    string color = query.getColumn(2).getText();
    string type = query.getColumn(3).getText();
    bool visible = query.getColumn(4).getInt();
    string uuid = query.getColumn(5).getText();
    int accountId = query.getColumn(6).getInt();

    CriptextDB::Label label = { id, text, color, type, visible, uuid, accountId };
    allLabels.push_back(label);

    return allLabels;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allLabels;
  }
}

vector<CriptextDB::Label> getLabelsByText(string dbPath, vector<string> names, int accountId){
  vector<CriptextDB::Label> allLabels;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    SQLite::Statement query(db, "select * from label where text in (" + DBUtils::joinVector(names) + ") and accountId == " + to_string(accountId));

    while (query.executeStep())
    {
        int id = query.getColumn(0).getInt();
        string text = query.getColumn(1).getText();
        string color = query.getColumn(2).getText();
        string type = query.getColumn(3).getText();
        bool visible = query.getColumn(4).getInt();
        string uuid = query.getColumn(5).getText();
        int accountId = query.getColumn(6).getInt();

        CriptextDB::Label label = { id, text, color, type, visible, uuid, accountId };
        
        allLabels.push_back(label);
    }
    return allLabels;
  } catch (exception& e) {
    std::cout << e.what() << std::endl;
    return allLabels;
  }
}
