#include "DBUtils.h"

using namespace std;


string DBUtils::getFromEmail(string fromAddress){
  string fromEmail;
  size_t leftBracket = fromAddress.find_last_of("<");
  size_t rightBracket = fromAddress.find_last_of(">");
  if(rightBracket == string::npos || leftBracket == string::npos)
      fromEmail = fromAddress;
  else
      fromEmail = fromAddress.substr(leftBracket + 1, (fromAddress.length() - (leftBracket + 1)) - 1);
  return fromEmail;
}

string DBUtils::getDateForDBSaving(time_t date){
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

time_t DBUtils::getTimeFromDB(const std::string& date, bool is_dst, const std::string& format){
  struct tm tm = { 0 }; // Important, initialize all members
  int n = 0;
  sscanf(date.c_str(), "%d-%d-%d %d:%d:%d %n", &tm.tm_mon, &tm.tm_mday, &tm.tm_year,
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

vector<int> DBUtils::splitToVector(string str, const char delim){
	std::vector<int> vect;
  std::stringstream ss(str);

  if(str.empty()) return vect;

	std::string s;
	while (std::getline(ss, s, delim)) {
		vect.push_back(std::stoi(s));
	}
  return vect;
}

vector<string> DBUtils::splitToStringVector(string str, const char delim){
  std::vector<string> vect;
  std::stringstream ss(str);

	std::string s;
	while (std::getline(ss, s, delim)) {
		vect.push_back(s);
	}
  return vect;
}

string DBUtils::joinVector(vector<int> v){
  std::stringstream ss;
  for(size_t i = 0; i < v.size(); ++i)
  {
    if(i != 0)
      ss << ",";
    ss << to_string(v[i]);
  }
  return ss.str();
}

string DBUtils::joinVector(vector<string> v){
  std::stringstream ss;
  for(size_t i = 0; i < v.size(); ++i)
  {
    if(i != 0)
      ss << ",";
    ss << v[i];
  }
  return ss.str();
}

unordered_set<int> DBUtils::splitToSet(string str, const char delim){
  std::unordered_set<int> set;
  std::stringstream ss(str);

	std::string s;
	while (std::getline(ss, s, delim)) {
		set.insert(std::stoi(s));
	}
  return set;
}

string DBUtils::joinSet(unordered_set<int> v){
  std::stringstream ss;
  bool isFirst = true;
  for (const auto& elem: v) {
    if(isFirst){
      isFirst = false;
    } else {
      ss << ",";
    }
    ss << to_string(elem);
  }
  return ss.str();
}

string DBUtils::joinSet(unordered_set<string> v){
  std::stringstream ss;
  bool isFirst = true;
  for (const auto& elem: v) {
    if(isFirst){
      isFirst = false;
    } else {
      ss << ",";
    }
    ss << elem;
  }
  return ss.str();
}

