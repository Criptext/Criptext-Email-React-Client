#include "http.h"
#include <unistd.h>
#include <iostream>

struct mg_callbacks callbacks;
struct mg_context *ctx;

const char* civet_options[] = {
    "document_root",
    ".",
    "listening_ports",
    "8086",
    "request_timeout_ms",
    "10000",
    "error_log_file",
    "error.log",
    "enable_auth_domain_check",
    "no",
    0
};

int getEmailThreads(struct mg_connection *conn, void *cbdata){
  std::cout << "GET_THREADS_BY_ID" << std::endl;
  return postDecryptEmail(conn, cbdata);
}

int pong(struct mg_connection *conn, void *cbdata){
  std::cout << "PING PING" << std::endl;
  mg_send_http_ok( conn, "text/plain", 5);
  mg_write(conn, "pong\n", 5);
  return 1;
}

void http_init(){
  ctx = mg_start(&callbacks, 0, civet_options);
  mg_set_request_handler(ctx, "/threadsById", getEmailThreads, 0);
  mg_set_request_handler(ctx, "/ping", pong, 0);
}

void http_shutdown(){
  mg_stop(ctx);
}