#include "decrypt.h"

int postDecryptEmail(struct mg_connection *conn, void *cbdata) {
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

  cJSON *senderId, *deviceId, *type, *recipientId, *body, *headers, *fileKeys, *headersType;
  senderId = cJSON_GetObjectItemCaseSensitive(obj, "senderId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  type = cJSON_GetObjectItemCaseSensitive(obj, "messageType");
  body = cJSON_GetObjectItemCaseSensitive(obj, "body");
  headers = cJSON_GetObjectItemCaseSensitive(obj, "headers");
  headersType = cJSON_GetObjectItemCaseSensitive(obj, "headersMessageType");
  fileKeys = cJSON_GetObjectItemCaseSensitive(obj, "fileKeys");

  if (!cJSON_IsString(recipientId) || !cJSON_IsString(senderId) || !cJSON_IsNumber(deviceId) || !cJSON_IsNumber(type)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    std::cout << "Receiving Request Fail 3" << std::endl;
    return 400;
  }

  CriptextSignal signal(recipientId->valuestring);
  cJSON *response = cJSON_CreateObject();

  if (cJSON_IsString(body)) {
    try {
      uint8_t *plaintext_data = 0;
      size_t plaintext_len = 0;
      int result = signal.decryptText(&plaintext_data, &plaintext_len, body->valuestring, senderId->valuestring, deviceId->valueint, type->valueint);
      char *text = (char *)malloc(plaintext_len);
      memcpy(text, plaintext_data, plaintext_len);
      text[plaintext_len] = '\0';
      cJSON_AddStringToObject(response, "decryptedBody", text);
      free(text);
    } catch (exception &ex) {
      std::cout << "DENCRYPT BODY ERROR: " << ex.what() << std::endl;
      mg_send_http_error(conn, 500, "%s", "Unable to encrypt body");
      return 500;
    }
  }

  if (cJSON_IsString(headers)) {
    try {
      uint8_t *plaintext_data = 0;
      size_t plaintext_len = 0;
      int result = signal.decryptText(&plaintext_data, &plaintext_len, headers->valuestring, senderId->valuestring, deviceId->valueint, headersType->valueint);
      char *text = (char *)malloc(plaintext_len);
      memcpy(text, plaintext_data, plaintext_len);
      text[plaintext_len] = '\0';
      cJSON_AddStringToObject(response, "decryptedHeaders", text);
      free(text);
    } catch (exception &ex) {
      std::cout << "DECRYPT HEADER ERROR: " << ex.what() << std::endl;
      mg_send_http_error(conn, 500, "%s", "Unable to encrypt body");
      return 500;
    }
  }

  if (cJSON_IsArray(fileKeys)) {
    cJSON *myFileKeys = cJSON_CreateArray();
    cJSON *fileKey = NULL;

    cJSON_ArrayForEach(fileKey, fileKeys) {   
           
      try {
        uint8_t *plaintext_data = 0;
        size_t plaintext_len = 0;
        int result = signal.decryptText(&plaintext_data, &plaintext_len, fileKey->valuestring, senderId->valuestring, deviceId->valueint, type->valueint);
        char *text = (char *)malloc(plaintext_len);
        memcpy(text, plaintext_data, plaintext_len);
        text[plaintext_len] = '\0';
        cJSON *decryptedFileKey = cJSON_CreateString(text);
        cJSON_AddItemToArray(myFileKeys, decryptedFileKey);
        free(text);
      } catch (exception &ex) {
        std::cout << "DECRYPT FILEKEY ERROR: " << ex.what() << std::endl;
        mg_send_http_error(conn, 500, "%s", "Unable to encrypt body");
        return 500;
      }
    }

    cJSON_AddItemToObject(response, "decryptedFileKeys", myFileKeys);
  }

  return SendJSON(conn, response);
}

int postDecryptKey(struct mg_connection *conn, void *cbdata) {
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

  cJSON *deviceId, *type, *recipientId, *key;
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  type = cJSON_GetObjectItemCaseSensitive(obj, "messageType");
  key = cJSON_GetObjectItemCaseSensitive(obj, "key");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId) || !cJSON_IsNumber(type)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }

  CriptextSignal signal(recipientId->valuestring);

  uint8_t *plaintext_data = 0;
  size_t plaintext_len = 0;
  int result = signal.decryptText(&plaintext_data, &plaintext_len, key->valuestring, recipientId->valuestring, deviceId->valueint, type->valueint);

  if (result < 0) {
    std::string unencrypted = "Content Unencrypted";
    mg_send_http_error(conn, 400, "%s", unencrypted.c_str());
    return 400;
  }

  mg_send_http_ok( conn, "application/octet-stream", plaintext_len);
  mg_write(conn, plaintext_data, plaintext_len);
  return 200;
}