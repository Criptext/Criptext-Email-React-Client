#include <civetweb.h>
#include <cjson/cJSON.h>
#include "cors.h"
#include <string>
#include <iostream>
#include "../../axolotl/Thread.h"
#include "../../../../signal_interface/src/http/handlers/helpers.h"

int postGetEmailThreads(struct mg_connection *conn, void *cbdata, std::string dbPath);