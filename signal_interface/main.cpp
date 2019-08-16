#include "src/http/http.h"
#include <string>

bool is_number(const std::string& s) {
    return !s.empty() && std::find_if(s.begin(), 
        s.end(), [](char c) { return !std::isdigit(c); }) == s.end();
}

int main(int argc, char const *argv[]){

    if (argc < 2) {
      std::cout << "No db path argument passed" <<std::endl;
      return -1;
    }

    char *dbPath = const_cast<char *>(argv[1]);
    char *port = "8085";

    if (argc > 2) {
      char *myPort = const_cast<char *>(argv[2]);
      if (is_number(port)) {
        port = myPort;
      }
    }

    std::cout << "DB PATH: " << dbPath << "\nPORT : " << port << std::endl;
    http_init(dbPath, port);

    while(1) {
        
    }

    http_shutdown();

    return 0;
}