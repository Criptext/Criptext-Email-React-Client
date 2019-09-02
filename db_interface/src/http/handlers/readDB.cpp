#include "readDB.h"
#include "Thread.h"

int postGetEmailThreads(struct mg_connection *conn, void *cbdata) {
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  
  std::cout << "Receiving Request" << std::endl;
  char buffer[1024 * 5];
  int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);

  if ((dlen < 1) || (dlen >= sizeof(buffer))) {
    std::cout << "Receiving Request Fail 1" << std::endl;
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }
  buffer[dlen] = 0;
  cJSON *obj = cJSON_Parse(buffer);
  
  if (obj == NULL) {
    std::cout << "Receiving Request Fail 2 : " << buffer << std::endl;
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }
  std::cout << "Request -> " << cJSON_Print(obj) << std::endl;

  cJSON *labelId, *date, *limit, *accountId;
  labelId = cJSON_GetObjectItemCaseSensitive(obj, "labelId");
  date = cJSON_GetObjectItemCaseSensitive(obj, "date");
  limit = cJSON_GetObjectItemCaseSensitive(obj, "limit");
  accountId = cJSON_GetObjectItemCaseSensitive(obj, "accountId");

  if (!cJSON_IsNumber(labelId) || !cJSON_IsString(date) || !cJSON_IsNumber(limit) || !cJSON_IsNumber(accountId)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    std::cout << "Receiving Request Fail 3" << std::endl;
    return 400;
  }

  cJSON *response = cJSON_CreateObject();

  CriptextDB::getThreadsByLabel()


  return SendJSON(conn, response);
}