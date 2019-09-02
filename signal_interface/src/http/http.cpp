#include "http.h"
#include <unistd.h>
#include <iostream>

struct mg_callbacks callbacks;
struct mg_context *ctx;

char* db_path;

int decryptEmail(struct mg_connection *conn, void *cbdata){
  return postDecryptEmail(conn, cbdata, db_path);
}

int decryptKey(struct mg_connection *conn, void *cbdata){
  return postDecryptKey(conn, cbdata, db_path);
}

int encryptKey(struct mg_connection *conn, void *cbdata){
  return postEncryptKey(conn, cbdata, db_path);
}

int encryptEmail(struct mg_connection *conn, void *cbdata){
  return postEncryptEmail(conn, cbdata, db_path);
}

int sessionCreate(struct mg_connection *conn, void *cbdata){
  return processKeyBundle(conn, cbdata, db_path);
}

int accountCreate(struct mg_connection *conn, void *cbdata){
  return createAccount(conn, cbdata, db_path);
}

int keyBundleCreate(struct mg_connection *conn, void *cbdata){
  return createKeyBundle(conn, cbdata, db_path);
}

int preKeysCreate(struct mg_connection *conn, void *cbdata){
  return createPreKeys(conn, cbdata, db_path);
}

int pong(struct mg_connection *conn, void *cbdata){
  std::cout.flush();
  std::cout << "PING" << std::endl;
  mg_send_http_ok( conn, "text/plain", 5);
  mg_write(conn, "pong\n", 5);
  return 1;
}

void http_init(char *dbPath, char *port){
  db_path = dbPath;

  const char* civet_options[] = {
    "document_root",
    ".",
    "listening_ports",
    port,
    "request_timeout_ms",
    "10000",
    "error_log_file",
    "error.log",
    "enable_auth_domain_check",
    "no",
    0
  };

  ctx = mg_start(&callbacks, 0, civet_options);
  mg_set_request_handler(ctx, "/decrypt", decryptEmail, 0);
  mg_set_request_handler(ctx, "/decrypt/key", decryptKey, 0);
  mg_set_request_handler(ctx, "/encrypt/key", encryptKey, 0);
  mg_set_request_handler(ctx, "/encrypt/email", encryptEmail, 0);
  mg_set_request_handler(ctx, "/account", accountCreate, 0);
  mg_set_request_handler(ctx, "/keybundle", keyBundleCreate, 0);
  mg_set_request_handler(ctx, "/prekey", preKeysCreate, 0);
  mg_set_request_handler(ctx, "/session/create", sessionCreate, 0);
  mg_set_request_handler(ctx, "/ping", pong, 0);
}

void http_shutdown(){
  mg_stop(ctx);
}