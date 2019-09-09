#ifndef DB_UTILS_H_
#define DB_UTILS_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <sqlite_modern_cpp.h>
#include <string>
#include <memory>
#include <vector>
#include <ctime>
#include <unordered_set>
#include <sstream>


using namespace std;

class DBUtils{
  public:
  static string getFromEmail(string fromAddress);
  static string getDateForDBSaving(time_t date);
  static time_t getTimeFromDB(const std::string& date, bool is_dst = false, const std::string& format = "%Y-%b-%d %H:%M:%S");
  static vector<int> splitToVector(string str, const char delim = ',');
  static vector<string> splitToStringVector(string str, const char delim = ',');
  static string joinVector(vector<int> v);
  static string joinVector(vector<string> v);
  static unordered_set<int> splitToSet(string str, const char delim = ',');
  static string joinSet(unordered_set<int> v);
  static string joinSet(unordered_set<string> v);
};

#endif