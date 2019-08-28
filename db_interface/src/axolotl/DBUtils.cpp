#include "DBUtils.h"

using namespace std;

class DBUtils{
  static string DBUtils::getFromEmail(string fromAddress){
    string fromEmail;
    size_t leftBracket = fromAddress.find_last_of("<");
    size_t rightBracket = fromAddress.find_last_of(">");
    if(rightBracket == string::npos || leftBracket == string::npos)
        fromEmail = fromAddress;
    else
        fromEmail = fromAddress.substr(leftBracket + 1, rightBracket);
    return fromEmail;
  }

  static string DBUtils::getDateForDBSaving(time_t date){
    //Time convertion for sqlite binding
    struct tm *currentTime;
    time ( &date );
    currentTime = gmtime ( &date );

    const int TIME_STRING_LENGTH = 20;
    char buffer [TIME_STRING_LENGTH];

    // SQLite expected date string format is "YYYY-MM-DD HH:MM:SS" (there are others too)
    strftime(buffer, TIME_STRING_LENGTH, "%Y-%m-%d %H:%M:%S", currentTime);
    return string(buffer);
  }

  static time_t DBUtils::getDateFromDB(string date){
    struct tm tm = { 0 }; // Important, initialize all members
    int n = 0;
    sscanf(date.c_str, "%d-%d-%d %d:%d:%d %n", &tm.tm_mon, &tm.tm_mday, &tm.tm_year,
        &tm.tm_hour, &tm.tm_min, &tm.tm_sec, &n);
    // If scan did not completely succeed or extra junk
    if (n == 0 || date[n]) {
      return (time_t) -1;
    }
    tm.tm_isdst = -1; // Assume local daylight setting per date/time
    tm.tm_mon--;      // Months since January
    // Assume 2 digit year if in the range 2000-2099, else assume year as given
    if (tm.tm_year >= 0 && tm.tm_year < 100) {
      tm.tm_year += 2000;
    }
    tm.tm_year -= 1900; // Years since 1900
    return mktime(&tm);
  }

  template<typename T>
  static string DBUtils::joinVector(vector<T> v){
    std::stringstream ss;
    for(size_t i = 0; i < v.size(); ++i)
    {
      if(i != 0)
        ss << ",";
      ss << to_string(v[i]);
    }
    return ss.str();
  }

  template<typename T>
  static string DBUtils::joinSet(unordered_set<T> v){
    std::stringstream ss;
    for(size_t i = 0; i < v.size(); ++i)
    {
      if(i != 0)
        ss << ",";
      ss << to_string(v[i]);
    }
    return ss.str();
  }
};

