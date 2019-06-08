#include "http.h"

#include <openssl/sha.h>
#include <unistd.h>
#include <CriptextSignal>

const char* civet_options[] = {
    "document_root",
    ".",
    "listening_ports",
    "8085",
    "request_timeout_ms",
    "10000",
    "error_log_file",
    "error.log",
    "enable_auth_domain_check",
    "no",
    0
};

void http_init(){
  curl_global_init(CURL_GLOBAL_ALL);

  login_url = getenv("BOB_LOGIN_URL");
  get_kb_url = getenv("BOB_GET_KEYBUNDLE_URL");

  ctx = mg_start(&callbacks, 0, civet_options);
  mg_set_request_handler(ctx, "/decrypt", decrypt, 0);

}

void http_shutdown(){
  curl_global_cleanup();
  mg_stop(ctx);
}

int decrypt(struct mg_connection *conn, void *cbdata){

    CriptextSignal signal();

    mg_send_http_ok( conn, "text/plain", 5);
    mg_write(conn, "pong\n", 5);
    return 1;
}