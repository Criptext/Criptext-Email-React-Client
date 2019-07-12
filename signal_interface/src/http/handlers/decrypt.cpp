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

  cJSON *senderId, *deviceId, *type, *recipientId, *body, *headers, *fileKeys;
  senderId = cJSON_GetObjectItemCaseSensitive(obj, "senderId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  type = cJSON_GetObjectItemCaseSensitive(obj, "messageType");
  body = cJSON_GetObjectItemCaseSensitive(obj, "body");
  headers = cJSON_GetObjectItemCaseSensitive(obj, "headers");
  fileKeys = cJSON_GetObjectItemCaseSensitive(obj, "fileKeys");

  if (!cJSON_IsString(recipientId) || !cJSON_IsString(senderId) || !cJSON_IsNumber(deviceId) || !cJSON_IsNumber(type)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    std::cout << "Receiving Request Fail 3" << std::endl;
    return 400;
  }

  CriptextSignal signal(recipientId->valuestring);

  uint8_t *plaintext_data = 0;
  size_t plaintext_len = 0;
  int result = signal.decryptText(&plaintext_data, &plaintext_len, body->valuestring, senderId->valuestring, deviceId->valueint, type->valueint);

  if (result < 0) {
    std::string unencrypted = "Content Unencrypted";
    mg_send_http_ok( conn, "text/plain", strlen(unencrypted.c_str()));
    mg_write(conn, unencrypted.c_str(), strlen(unencrypted.c_str()));
    return -1;
  }

  mg_send_http_ok( conn, "text/plain", plaintext_len);
  mg_write(conn, plaintext_data, plaintext_len);
  return 1;
}