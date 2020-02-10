#include "http.h"
#include <unistd.h>
#include <iostream>

struct mg_callbacks callbacks;
struct mg_context *ctx;

char* db_path;
string password;
char* my_token;

int decryptEmail(struct mg_connection *conn, void *cbdata){
  return postDecryptEmail(conn, cbdata, db_path, const_cast<char *>(password.c_str()));
}

int decryptKey(struct mg_connection *conn, void *cbdata){
  return postDecryptKey(conn, cbdata, db_path, const_cast<char *>(password.c_str()));
}

int encryptKey(struct mg_connection *conn, void *cbdata){
  return postEncryptKey(conn, cbdata, db_path, const_cast<char *>(password.c_str()));
}

int encryptEmail(struct mg_connection *conn, void *cbdata){
  return postEncryptEmail(conn, cbdata, db_path, const_cast<char *>(password.c_str()));
}

int sessionCreate(struct mg_connection *conn, void *cbdata){
  return processKeyBundle(conn, cbdata, db_path, const_cast<char *>(password.c_str()));
}

int accountCreate(struct mg_connection *conn, void *cbdata){
  return createAccount(conn, cbdata, db_path, const_cast<char *>(password.c_str()));
}

int keyBundleCreate(struct mg_connection *conn, void *cbdata){
  return createKeyBundle(conn, cbdata, db_path, const_cast<char *>(password.c_str()));
}

int preKeysCreate(struct mg_connection *conn, void *cbdata){
  return createPreKeys(conn, cbdata, db_path, const_cast<char *>(password.c_str()));
}

int pong(struct mg_connection *conn, void *cbdata){
  mg_send_http_ok(conn, "text/plain", 5);
  mg_write(conn, "pong\n", 5);
  return 1;
}

int setPassword(struct mg_connection *conn, void *cbdata){
  string pass = decryptPassword(conn, cbdata, my_token, password);
  if (pass.empty()) {
    return -1;
  }
  password = pass;
  return 1;
}

void http_init(char *dbPath, char *port, char* token){
  db_path = dbPath;
  my_token = token;

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
  mg_set_request_handler(ctx, "/password/set", setPassword, 0);
  mg_set_request_handler(ctx, "/ping", pong, 0);
}

void http_shutdown(){
  mg_stop(ctx);
}