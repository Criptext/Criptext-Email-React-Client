#include "cors.h"

int cors(struct mg_connection *conn) {
  const struct mg_request_info *ri = mg_get_request_info(conn);
  mg_printf(conn,
      "HTTP/1.1 200 OK\r\n"
      "Access-Control-Allow-Origin: *\r\n"
      "Access-Control-Allow-Methods: *\r\n",
      "Access-Control-Allow-Headers: *\r\n");
  if (!strcmp(ri->request_method, "OPTIONS")) {
    return -1;
  }
  return 0;
}