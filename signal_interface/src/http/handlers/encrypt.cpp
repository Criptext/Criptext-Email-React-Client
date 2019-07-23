#include "encrypt.h"

int postEncryptKey(struct mg_connection *conn, void *cbdata) {
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  
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

  cJSON *deviceId, *recipientId, *keyData, *key;
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  keyData = cJSON_GetObjectItemCaseSensitive(obj, "key");
  key = cJSON_GetObjectItemCaseSensitive(keyData, "data");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }

  CriptextSignal signal(recipientId->valuestring);

  size_t keyLength = 16;
  char *encryptedText = 0;
  uint8_t keyBytes[keyLength];

  cJSON *keyByte = NULL;
  int i = 0;
  cJSON_ArrayForEach(keyByte, key) {
    keyBytes[i] = keyByte->valueint; 
    i++;
  }

  uint8_t *myKey = reinterpret_cast<uint8_t *>(malloc(keyLength));
  memmove(myKey, keyBytes, keyLength);

  int result = signal.encryptText(&encryptedText, myKey, keyLength, recipientId->valuestring, deviceId->valueint);

  free(myKey);

  if (result < 0) {
    std::string unencrypted = "Content Unencrypted";
    mg_send_http_error(conn, 400, "%s", unencrypted.c_str());
    return 400;
  }

  mg_send_http_ok( conn, "plain/text", strlen(encryptedText));
  mg_write(conn, encryptedText, strlen(encryptedText));
  return 200;
}