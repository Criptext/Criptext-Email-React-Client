#include <civetweb.h>
#include <cjson/cJSON.h>
#include <string>

int SendJSON(struct mg_connection *conn, cJSON *json_obj);