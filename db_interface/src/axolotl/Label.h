#ifndef LABEL_H_
#define LABEL_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct Label {
    int id;
    string text;
    string color;
    string type;
    bool visible;
    string uuid;
    optional<int> accountId;
  };

  int createLabel(string dbPath, string text, string color, string type, bool visible, string uuid, int accountId);
  int deleteLabelById(string dbPath, int labelId, int accountId);
  vector<Label> getAllLabels(string dbPath, int accountId);
  Label getLabelById(string dbPath, int labelId, int accountId);
  vector<Label> getLabelsByIds(string dbPath, vector<int> labelIds, int accountId);
  vector<Label> getLabelsByText(string dbPath, vector<string> names, int accountId);

  static const Label INBOX = { 1, "0091ff", "Inbox", "system", true, "00000000-0000-0000-0000-000000000001", nullopt };
  static const Label SPAM = { 2, "f1453d", "Spam", "system", true, "00000000-0000-0000-0000-000000000002", nullopt };
  static const Label SENT = { 3, "a0d06e", "Sent", "system", true, "00000000-0000-0000-0000-000000000003", nullopt };
  static const Label STARRED = { 5, "ffe137", "Starred", "system", true, "00000000-0000-0000-0000-000000000005", nullopt };
  static const Label DRAFT = { 6, "626262", "Draft", "system", true, "00000000-0000-0000-0000-000000000006", nullopt };
  static const Label TRASH = { 7, "ed63ff", "Trash", "system", true, "00000000-0000-0000-0000-000000000007", nullopt };
} 

#endif