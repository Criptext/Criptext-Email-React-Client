#include <civetweb.h>
#include <cjson/cJSON.h>
#include <string>
#include <vector>
#include <iostream>

int SendJSON(struct mg_connection *conn, cJSON *json_obj);
int parseBody(char **body, struct mg_connection *conn);