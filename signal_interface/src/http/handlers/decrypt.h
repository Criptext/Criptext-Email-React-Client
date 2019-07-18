#include <civetweb.h>
#include <cjson/cJSON.h>
#include "cors.h"

int postDecrypt(struct mg_connection *conn, void *cbdata);
int postDecryptKey(struct mg_connection *conn, void *cbdata);