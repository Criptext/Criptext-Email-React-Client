#include <civetweb.h>
#include <cjson/cJSON.h>
#include <string>
#include <iostream>
#include "../../crypto/signal.h"
#include "cors.h"

int postEncryptKey(struct mg_connection *conn, void *cbdata);