#ifndef DB_UTILS_H_
#define DB_UTILS_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>
#include <ctime>
#include <unordered_set>


using namespace std;

namespace CriptextDB {
  class DBUtils{
    public:
    static string getFromEmail(string fromAddress);
    static string getDateForDBSaving(time_t date);
    static time_t getTimeFromDB(const std::string& str, bool is_dst = false, const std::string& format = "%Y-%b-%d %H:%M:%S");
    template<typename T>
    static string joinVector(vector<T> v);
    template<typename T>
    static string joinSet(unordered_set<T> v);
  };
} 

#endif