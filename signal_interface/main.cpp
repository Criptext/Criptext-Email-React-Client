#include "src/http/http.h"
#include <string>
#include <execinfo.h>

#include "spdlog/spdlog.h"
#include "spdlog/sinks/rotating_file_sink.h"
#include "signal.h"

void PrintStackTrace()
{
   void *array[256];
   size_t size = backtrace(array, 256);
   char ** strings = backtrace_symbols(array, 256);
   if (strings)
   {
      spdlog::critical("--Stack trace follows (%zd frames):\n", size);
      for (size_t i = 0; i < size; i++) spdlog::critical("  {0}", strings[i]);
      spdlog::critical("--End Stack trace\n");
      free(strings);
   }
   else spdlog::critical("PrintStackTrace:  Error, could not generate stack trace!\n");
}

static void CrashSignalHandler(int sig)
{
   signal(SIGSEGV, SIG_DFL);
   signal(SIGBUS,  SIG_DFL);
   signal(SIGILL,  SIG_DFL);
   signal(SIGABRT, SIG_DFL);
   signal(SIGFPE,  SIG_DFL);

   spdlog::critical("CrashSignalHandler called with signal %i... I'm going to print a stack trace, then kill the process.\n", sig);
   PrintStackTrace();
   spdlog::critical("Crashed process aborting now....!\n");
   spdlog::shutdown();
   http_shutdown();
   abort();
}

bool is_number(const std::string& s) {
    return !s.empty() && std::find_if(s.begin(), 
        s.end(), [](char c) { return !std::isdigit(c); }) == s.end();
}

int main(int argc, char const *argv[]){
   char *logsPath = "alice_logs.txt";
   if (argc > 3) {
      logsPath = const_cast<char *>(argv[3]);
   }

   auto rotating_logger = spdlog::rotating_logger_mt("Alice Logs", logsPath, 1048576 * 5, 3);
   spdlog::set_default_logger(rotating_logger);
   spdlog::flush_every(std::chrono::seconds(3));
   spdlog::info("Starting Service");
   if (argc < 2) {
      spdlog::info("No db path argument passed");
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

   spdlog::info("DB PATH: {0}", dbPath);
   spdlog::info("PORT : {0}", port);

   signal(SIGSEGV, CrashSignalHandler);
   signal(SIGBUS,  CrashSignalHandler);
   signal(SIGILL,  CrashSignalHandler);
   signal(SIGABRT, CrashSignalHandler);
   signal(SIGFPE,  CrashSignalHandler);

   http_init(dbPath, port);

   while(1) {
      
   }

   http_shutdown();
   return 0;
}