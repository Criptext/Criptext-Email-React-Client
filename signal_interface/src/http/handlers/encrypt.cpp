#include "encrypt.h"

int postEncryptKey(struct mg_connection *conn, void *cbdata, char *dbPath) {
  int endpointId = rand() % 1000000;
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  
  spdlog::info("[{0}] /encrypt/key Receiving Request", endpointId);
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
    mg_send_http_error(conn, 400, "%s", "Not a json object");
    return 400;
  }

  cJSON *deviceId, *recipientId, *keyData, *key;
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  keyData = cJSON_GetObjectItemCaseSensitive(obj, "key");
  key = cJSON_GetObjectItemCaseSensitive(keyData, "data");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId)) {
    spdlog::error("[{0}] Missing Params", endpointId, bufferData);
    mg_send_http_error(conn, 400, "%s", "Missing params");
    return 400;
  }

  CriptextSignal signal(recipientId->valuestring, dbPath);

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
    spdlog::error("[{0}] {1}", endpointId, unencrypted.c_str());
    mg_send_http_error(conn, 400, "%s", unencrypted.c_str());
    return 400;
  }

  spdlog::info("[{0}] Successful response", endpointId);
  mg_send_http_ok( conn, "plain/text", strlen(encryptedText));
  mg_write(conn, encryptedText, strlen(encryptedText));
  return 200;
}

int postEncryptEmail(struct mg_connection *conn, void *cbdata, char *dbPath) {
  int endpointId = rand() % 1000000;
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  std::cout << "/encrypt/email Receiving Request" << std::endl;
  spdlog::info("[{0}] /encrypt/email Receiving Request", endpointId);
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
    mg_send_http_error(conn, 400, "%s", "Not a json object");
    return 400;
  }

  cJSON *accountRecipientId, *deviceId, *recipientId, *body, *preview, *fileKeys;
  accountRecipientId = cJSON_GetObjectItemCaseSensitive(obj, "accountRecipientId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  body = cJSON_GetObjectItemCaseSensitive(obj, "body");
  preview = cJSON_GetObjectItemCaseSensitive(obj, "preview");
  fileKeys = cJSON_GetObjectItemCaseSensitive(obj, "fileKeys");

  if (!cJSON_IsString(accountRecipientId) || !cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }

  spdlog::info("[{0}] Request -> <accountId: {1}, recipientId: {2}>", endpointId, accountRecipientId->valuestring, recipientId->valuestring);

  CriptextSignal signal(accountRecipientId->valuestring, dbPath);

  cJSON *response = cJSON_CreateObject();

  if (cJSON_IsString(body)) {
    try {
      char *encryptedBody = 0;
      size_t len = strlen(body->valuestring);
      uint8_t *text = (uint8_t *)malloc(len);
      memcpy(text, body->valuestring, len);
      int type = signal.encryptText(&encryptedBody, text, len, recipientId->valuestring, deviceId->valueint);
      cJSON_AddStringToObject(response, "bodyEncrypted", encryptedBody);
      cJSON_AddNumberToObject(response, "bodyMessageType", type);
      free(text);
    } catch (exception &ex) {
      spdlog::error("[{0}] ENCRYPT BODY ERROR {1}", endpointId, ex.what());
      mg_send_http_error(conn, 500, "%s", "Unable to encrypt body");
      return 500;
    }
  }

  if (cJSON_IsString(preview)) {
    try {
      char *encryptedPreview = 0;
      size_t len = strlen(preview->valuestring);
      uint8_t *text = (uint8_t *)malloc(len);
      memcpy(text, preview->valuestring, len);
      int type = signal.encryptText(&encryptedPreview, text, len, recipientId->valuestring, deviceId->valueint);
      cJSON_AddStringToObject(response, "previewEncrypted", encryptedPreview);
      cJSON_AddNumberToObject(response, "previewMessageType", type);
      free(text);
    } catch (exception &ex) {
      spdlog::error("[{0}] ENCRYPT PREVIEW ERROR {1}", endpointId, ex.what());
      mg_send_http_error(conn, 500, "%s", "Unable to encrypt body");
      return 500;
    }
  }

  if (cJSON_IsArray(fileKeys)) {
    cJSON *myFileKeys = cJSON_CreateArray();
    cJSON *fileKey = NULL;

    cJSON_ArrayForEach(fileKey, fileKeys) {   
           
      try {
        char *encryptedFileKey = 0;
        size_t len = strlen(fileKey->valuestring);
        uint8_t *text = (uint8_t *)malloc(len);
        memcpy(text, fileKey->valuestring, len);
        signal.encryptText(&encryptedFileKey, text, len, recipientId->valuestring, deviceId->valueint);

        cJSON *decryptedFileKey = cJSON_CreateString(encryptedFileKey);
        cJSON_AddItemToArray(myFileKeys, decryptedFileKey);
        free(text);
      } catch (exception &ex) {
        spdlog::error("[{0}] ENCRYPT FILEKEYS ERROR {1}", endpointId, ex.what());
        mg_send_http_error(conn, 500, "%s", "Unable to encrypt body");
        return 500;
      }
    }

    cJSON_AddItemToObject(response, "fileKeysEncrypted", myFileKeys);
  }

  spdlog::info("[{0}] Successful response", endpointId);
  return SendJSON(conn, response);
}