#include "decrypt.h"

int postDecryptEmail(struct mg_connection *conn, void *cbdata, char *dbPath) {
  int endpointId = rand() % 1000000;

  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  
  spdlog::info("[{0}] /decrypt Receiving Request", endpointId);
  char *bufferData;
  int readLength = parseBody(&bufferData, conn);

  if (readLength <= 0) {
    spdlog::error("[{0}] Request data too big", endpointId);
    mg_send_http_error(conn, 400, "%s", "Request data too big");
    return 400;
  }
  
  cJSON *obj = cJSON_Parse(bufferData);
  
  if (obj == NULL) {
    spdlog::error("[{0}] Not a json object: {1}", endpointId, bufferData);
    mg_send_http_error(conn, 400, "%s", bufferData);
    return 400;
  }

  std::cout << cJSON_Print(obj) << std::endl;

  cJSON *emailKey, *senderId, *deviceId, *type, *recipientId, *body, *headers, *fileKeys, *headersType;
  senderId = cJSON_GetObjectItemCaseSensitive(obj, "senderId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  emailKey = cJSON_GetObjectItemCaseSensitive(obj, "emailKey");
  type = cJSON_GetObjectItemCaseSensitive(obj, "messageType");
  body = cJSON_GetObjectItemCaseSensitive(obj, "body");
  headers = cJSON_GetObjectItemCaseSensitive(obj, "headers");
  headersType = cJSON_GetObjectItemCaseSensitive(obj, "headersMessageType");
  fileKeys = cJSON_GetObjectItemCaseSensitive(obj, "fileKeys");
  if (!cJSON_IsNumber(emailKey) || !cJSON_IsString(recipientId) || !cJSON_IsString(senderId) || !cJSON_IsNumber(deviceId) || !cJSON_IsNumber(type)) {
    spdlog::error("[{0}] Missing params", endpointId);
    mg_send_http_error(conn, 400, "%s", "Missing params");
    return 400;
  }
  spdlog::info("[{0}] Request -> <RecipientId: {1}, senderId: {2}, EmailKey: {3}>", endpointId, recipientId->valuestring, senderId->valuestring, emailKey->valueint);
  
  CriptextSignal signal(recipientId->valuestring, dbPath);
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
      spdlog::error("[{0}] DECRYPT BODY ERROR {1}", endpointId, ex.what());
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
      spdlog::error("[{0}] DECRYPT HEADER ERROR {1}", endpointId, ex.what());
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
        spdlog::error("[{0}] DECRYPT FILEKEY ERROR {1}", endpointId, ex.what());
        mg_send_http_error(conn, 500, "%s", "Unable to encrypt body");
        return 500;
      }
    }

    cJSON_AddItemToObject(response, "decryptedFileKeys", myFileKeys);
  }

  spdlog::info("[{0}] Successful response", endpointId);
  return SendJSON(conn, response);
}

int postDecryptKey(struct mg_connection *conn, void *cbdata, char *dbPath) {
  int endpointId = rand() % 1000000;
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  
  spdlog::info("[{0}] /decrypt/key Receiving Request", endpointId);

  char *bufferData;
  int readLength = parseBody(&bufferData, conn);

  if (readLength <= 0) {
    spdlog::error("[{0}] Request data too big", endpointId);
    mg_send_http_error(conn, 400, "%s", "Request data too big");
    return 400;
  }
  
  cJSON *obj = cJSON_Parse(bufferData);
  
  if (obj == NULL) {
    spdlog::error("[{0}] Not a json object: {1}", endpointId, bufferData);
    mg_send_http_error(conn, 400, "%s", bufferData);
    return 400;
  }
  spdlog::info("[{0}] Request -> {1}", endpointId, bufferData);

  cJSON *deviceId, *type, *recipientId, *key;
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  type = cJSON_GetObjectItemCaseSensitive(obj, "messageType");
  key = cJSON_GetObjectItemCaseSensitive(obj, "key");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId) || !cJSON_IsNumber(type)) {
    spdlog::error("[{0}]  Missing Params", endpointId);
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }

  CriptextSignal signal(recipientId->valuestring, dbPath);

  uint8_t *plaintext_data = 0;
  size_t plaintext_len = 0;
  int result = signal.decryptText(&plaintext_data, &plaintext_len, key->valuestring, recipientId->valuestring, deviceId->valueint, type->valueint);

  if (result < 0) {
    std::string unencrypted = "Content Unencrypted";
    spdlog::error("[{0}]  {1}", unencrypted.c_str());
    mg_send_http_error(conn, 400, "%s", unencrypted.c_str());
    return 400;
  }

  mg_send_http_ok( conn, "application/octet-stream", plaintext_len);
  mg_write(conn, plaintext_data, plaintext_len);
  spdlog::info("[{0}] Successful response", endpointId);
  return 200;
}