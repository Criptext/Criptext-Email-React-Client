#include "helpers.h"

int SendJSON(struct mg_connection *conn, cJSON *json_obj) {
	char *json_str = cJSON_PrintUnformatted(json_obj);
	size_t json_str_len = strlen(json_str);

	mg_printf(conn,
		"HTTP/1.1 200 OK\r\n"
		"Access-Control-Allow-Origin: *\r\n"
		"Access-Control-Allow-Methods: *\r\n"
		"Access-Control-Allow-Headers: *\r\n");
	mg_send_http_ok(conn, "application/json; charset=utf-8", json_str_len);
	mg_write(conn, json_str, json_str_len);

	cJSON_free(json_str);
	return (int)json_str_len;
}

void sendOK(struct mg_connection *conn, string response) {
  mg_printf(conn,
		"HTTP/1.1 200 OK\r\n"
		"Access-Control-Allow-Origin: *\r\n"
		"Access-Control-Allow-Methods: *\r\n"
		"Access-Control-Allow-Headers: *\r\n");
	mg_send_http_ok(conn, "text/plain", response.length());
	mg_write(conn, response.c_str(), response.length());
}

void sendBytes(struct mg_connection *conn, uint8_t *bytes, size_t len) {
  mg_printf(conn,
		"HTTP/1.1 200 OK\r\n"
		"Access-Control-Allow-Origin: *\r\n"
		"Access-Control-Allow-Methods: *\r\n"
		"Access-Control-Allow-Headers: *\r\n");
  mg_send_http_ok( conn, "application/octet-stream", len);
  mg_write(conn, bytes, len);
}

void sendError(struct mg_connection *conn, int code, string response) {
  mg_printf(conn,
		"HTTP/1.1 %i\r\n"
		"Access-Control-Allow-Origin: *\r\n"
		"Access-Control-Allow-Methods: *\r\n"
		"Access-Control-Allow-Headers: *\r\n"
    "Connection: close\r\n"
		"\r\n"
		"%s", code, response.c_str());
}

int parseBody(char **body, struct mg_connection *conn){
	int readLength = 0;
  vector<char> myData;
  while (true) {
    char buffer[512];
    int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);
    if (dlen <= 0) {
      break;
    }
    myData.insert(myData.end(), buffer, buffer + dlen);
    readLength += dlen;
  }

	char *myBody = myData.data();
  *body = strdup(myBody);
  return readLength;
}

string parseBody(struct mg_connection* conn) {
	int readLength = 0;
	std::vector<char> myData;
	while (true) {
		char buffer[512];
		int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);
		if (dlen <= 0) {
			break;
		}
		myData.insert(myData.end(), buffer, buffer + dlen);
		readLength += dlen;
	}

	return string(myData.begin(), myData.end());
}

string parseSignalError(int error) {
  switch(error){
    case -1001:
      return "Signal Error -1001: Duplicated Message";
    case -1002:
      return "Signal Error -1002: Invalid Key";
    case -1003:
      return "Signal Error -1003: Invalid Key ID";
    case -1004:
      return "Signal Error -1004: Invalid MAC";
    case -1005:
      return "Signal Error -1005: Invalid Message";
    case -1006:
      return "Signal Error -1006: Invalid Version";
    case -1007:
      return "Signal Error -1007: Legacy Message";
    case -1008:
      return "Signal Error -1008: No Session";
    case -1009:
      return "Signal Error -1009: Stale Key Exchange";
    case -1010:
      return "Signal Error -1010: Untrusted Identity Key";
    case -1011:
      return "Signal Error -1011: Signature Verification Failure";
    case -1100:
      return "Signal Error -1100: Invalid Proto Buffer";
    case -1200:
      return "Signal Error -1200: Version Mismatch";
    case -1201:
      return "Signal Error -1201: Identity Mismatch";
    case -1300:
      return "Signal Error -1300: Invalid Message Type";
    default:
      return "Signal Uknown Error";
  }
}