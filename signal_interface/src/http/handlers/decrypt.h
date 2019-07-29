#include <civetweb.h>
#include <cjson/cJSON.h>
#include "cors.h"
#include <string>
#include <iostream>
#include "helpers.h"
#include "../../crypto/signal.h"

int postDecryptEmail(struct mg_connection *conn, void *cbdata);
int postDecryptKey(struct mg_connection *conn, void *cbdata);