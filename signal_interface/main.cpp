#include "src/http/http.h"
#include <string>

int main(int argc, char const *argv[]){

    if (argc < 2) {
      std::cout << "No db path argument passed" <<std::endl;
      return -1;
    }

    char *dbPath = const_cast<char *>(argv[1]);
    std::cout << "DB PATH IS : " << dbPath << std::endl;
    http_init(dbPath);

    while(1) {
        
    }

    http_shutdown();

    return 0;
}