#include <civetweb.h>
#include <cjson/cJSON.h>
#include <string>
#include <string.h>
#include <vector>
#include <iostream>
#include <string.h>

using namespace std;

int SendJSON(struct mg_connection *conn, cJSON *json_obj);
void sendOK(struct mg_connection *conn, string response);
void sendBytes(struct mg_connection *conn, uint8_t *bytes, size_t len);
void sendError(struct mg_connection *conn, int code, string response);
int parseBody(char **body, struct mg_connection *conn);
string parseBody(struct mg_connection* conn);
string parseSignalError(int error);