#include <civetweb.h>
#include <cjson/cJSON.h>

int createKeyBundle(struct mg_connection *conn, void *cbdata);
int createAccount(struct mg_connection *conn, void *cbdata);