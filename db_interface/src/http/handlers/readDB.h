#include <civetweb.h>
#include <cjson/cJSON.h>
#include "cors.h"
#include <string>
#include <iostream>
#include "helpers.h"

int postGetEmailThreads(struct mg_connection *conn, void *cbdata);