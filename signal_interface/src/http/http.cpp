#include "http.h"
#include <unistd.h>
#include <iostream>

struct mg_callbacks callbacks;
struct mg_context *ctx;

char* db_path;
char* password;

int decryptEmail(struct mg_connection *conn, void *cbdata){
  return postDecryptEmail(conn, cbdata, db_path, password);
}

int decryptKey(struct mg_connection *conn, void *cbdata){
  return postDecryptKey(conn, cbdata, db_path, password);
}

int encryptKey(struct mg_connection *conn, void *cbdata){
  return postEncryptKey(conn, cbdata, db_path, password);
}

int encryptEmail(struct mg_connection *conn, void *cbdata){
  return postEncryptEmail(conn, cbdata, db_path, password);
}

int sessionCreate(struct mg_connection *conn, void *cbdata){
  return processKeyBundle(conn, cbdata, db_path, password);
}

int accountCreate(struct mg_connection *conn, void *cbdata){
  return createAccount(conn, cbdata, db_path, password);
}

int keyBundleCreate(struct mg_connection *conn, void *cbdata){
  return createKeyBundle(conn, cbdata, db_path, password);
}

int preKeysCreate(struct mg_connection *conn, void *cbdata){
  return createPreKeys(conn, cbdata, db_path, password);
}

int pong(struct mg_connection *conn, void *cbdata){
  mg_send_http_ok( conn, "text/plain", 5);
  mg_write(conn, "pong\n", 5);
  return 1;
}

void http_init(char *dbPath, char *port, char* pass){
  db_path = dbPath;
  password = pass;

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