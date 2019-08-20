#include <civetweb.h>
#include <cjson/cJSON.h>
#include "cors.h"
#include <string>
#include <iostream>
#include <vector>
#include "helpers.h"
#include <time.h>
#include "../../crypto/signal.h"
#include "spdlog/spdlog.h"

int postDecryptEmail(struct mg_connection *conn, void *cbdata, char *dbPath);
int postDecryptKey(struct mg_connection *conn, void *cbdata, char *dbPath);