#include <string>
#include <iostream>
#include "../../crypto/signal.h"
#include "decrypt.h"


int postDecrypt(struct mg_connection *conn, void *cbdata) {
  std::cout << "Receiving Request" << std::endl;
  char buffer[1024];
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

  cJSON *senderId, *deviceId, *type, *accountId, *body, *headers, *fileKeys;
  senderId = cJSON_GetObjectItemCaseSensitive(obj, "senderId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  accountId = cJSON_GetObjectItemCaseSensitive(obj, "accountId");
  type = cJSON_GetObjectItemCaseSensitive(obj, "messageType");
  body = cJSON_GetObjectItemCaseSensitive(obj, "body");
  headers = cJSON_GetObjectItemCaseSensitive(obj, "headers");
  fileKeys = cJSON_GetObjectItemCaseSensitive(obj, "fileKeys");

  std::cout << "senderId -> " << senderId->valueint << " body -> " << body->valuestring << std::endl;

  if (!cJSON_IsNumber(accountId) || !cJSON_IsString(senderId) || !cJSON_IsNumber(deviceId) || !cJSON_IsNumber(type)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    std::cout << "Receiving Request Fail 3" << std::endl;
    return 400;
  }

  CriptextSignal signal(accountId->valueint);

  std::string decryptedBody = signal.decryptText(body->valuestring, senderId->valuestring, deviceId->valueint, type->valueint);

  mg_send_http_ok( conn, "text/plain", 5);
  mg_write(conn, &decryptedBody, 5);
  return 1;
}