#include <civetweb.h>
#include <cjson/cJSON.h>
#include <string>
#include <string.h>
#include <vector>
#include <iostream>
#include <string.h>

int SendJSON(struct mg_connection *conn, cJSON *json_obj);
int parseBody(char **body, struct mg_connection *conn);
std::string parseBody(struct mg_connection* conn);