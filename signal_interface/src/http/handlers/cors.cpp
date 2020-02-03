#include "cors.h"

bool cors(struct mg_connection *conn) {
  const struct mg_request_info *ri = mg_get_request_info(conn);
  if (strcmp(ri->request_method, "OPTIONS")) {
    return false;
  }
  mg_printf(conn,
    "HTTP/1.1 200 OK\r\n"
    "Access-Control-Allow-Origin: *\r\n"
    "Access-Control-Allow-Methods: *\r\n"
    "Access-Control-Allow-Headers: *\r\n");
  return true;
}