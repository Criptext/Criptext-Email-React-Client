#include "encrypt.h"

int postEncryptKey(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  int endpointId = rand() % 1000000;
  bool corsResult = cors(conn);
  if (corsResult) {
    return 201;
  }
  
  spdlog::info("[{0}] /encrypt/key Receiving Request", endpointId);

  if (password == 0) {
    sendError(conn, 401, "Missing Password Setup");
    return 401;
  }

  string bufferData = parseBody(conn);
  int readLength = bufferData.length();

  if (readLength <= 0) {
    spdlog::error("[{0}] Request data too big", endpointId);
    sendError(conn, 413, "Request Data Too Big");
    return 413;
  }

  cJSON *obj = cJSON_Parse(bufferData.c_str());
  
  if (obj == NULL) {
    spdlog::error("[{0}] Not a json object: {1}", endpointId, bufferData);
    sendError(conn, 422, bufferData);
    return 422;
  }

  cJSON *deviceId, *recipientId, *keyData, *key;
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  keyData = cJSON_GetObjectItemCaseSensitive(obj, "key");
  key = cJSON_GetObjectItemCaseSensitive(keyData, "data");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId)) {
    spdlog::error("[{0}] Missing Params", endpointId, bufferData);
    sendError(conn, 400, "Missing Params");
    return 400;
  }

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(recipientId->valuestring, db);

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

  (void)[v = std::move(db)]{};

  if (result < 0) {
    std::string unencrypted = parseSignalError(result);
    spdlog::error("[{0}] {1}", endpointId, unencrypted.c_str());
    sendError(conn, 500, unencrypted);
    return 500;
  }

  spdlog::info("[{0}] Successful response", endpointId);
  sendOK(conn, string(encryptedText));
  return 200;
}

int postEncryptEmail(struct mg_connection *conn, void *cbdata, char *dbPath, char *password) {
  int endpointId = rand() % 1000000;
  bool corsResult = cors(conn);
  if (corsResult) {
    return 201;
  }

  spdlog::info("[{0}] /encrypt/email Receiving Request", endpointId);

  if (password == 0) {
    sendError(conn, 401, "Missing Password Setup");
    return 401;
  }
  
  string bufferData = parseBody(conn);
  int readLength = bufferData.length();

  if (readLength <= 0) {
    spdlog::error("[{0}] Request data too big", endpointId);
    sendError(conn, 413, "Request Data Too Big");
    return 413;
  }

  cJSON *requestObj = cJSON_Parse(bufferData.c_str());
  
  if (requestObj == NULL) {
    spdlog::error("[{0}] Not a json object: {1}", endpointId, bufferData);
    sendError(conn, 422, bufferData);
    return 422;
  }

  cJSON *salt, *iv, *content;
  salt = cJSON_GetObjectItemCaseSensitive(requestObj, "salt");
  iv = cJSON_GetObjectItemCaseSensitive(requestObj, "iv");
  content = cJSON_GetObjectItemCaseSensitive(requestObj, "content");

  signal_buffer *myKey = 0;
  size_t saltLen = 0;
  const uint8_t *mySalt =  base64_decode(reinterpret_cast<unsigned char *>(salt->valuestring), strlen(salt->valuestring), &saltLen);
  size_t ivLen = 0;
  const uint8_t *myIv =  base64_decode(reinterpret_cast<unsigned char *>(iv->valuestring), strlen(iv->valuestring), &ivLen);
  int result = deriveKey(&myKey, mySalt, saltLen, password, strlen(password));
  size_t decodeLen = 0;
  const uint8_t *decodedRequest =  base64_decode(reinterpret_cast<unsigned char *>(content->valuestring), strlen(content->valuestring), &decodeLen);
  
  signal_buffer *decryptedResponse = 0;
  result = decrypt(&decryptedResponse, 2, myKey->data, myKey->len, myIv, ivLen, decodedRequest, decodeLen, 0);


  signal_buffer_free(myKey);

  cJSON *obj = cJSON_Parse(reinterpret_cast<char *>(decryptedResponse->data));
  cJSON *accountRecipientId, *deviceId, *recipientId, *body, *preview, *fileKeys;
  accountRecipientId = cJSON_GetObjectItemCaseSensitive(obj, "accountRecipientId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  body = cJSON_GetObjectItemCaseSensitive(obj, "body");
  preview = cJSON_GetObjectItemCaseSensitive(obj, "preview");
  fileKeys = cJSON_GetObjectItemCaseSensitive(obj, "fileKeys");

  if (!cJSON_IsString(accountRecipientId) || !cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId)) {
    sendError(conn, 400, "Missing Params");
    return 400;
  }

  spdlog::info("[{0}] Request -> <accountId: {1}, recipientId: {2}>", endpointId, accountRecipientId->valuestring, recipientId->valuestring);

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(accountRecipientId->valuestring, db);

  cJSON *response = cJSON_CreateObject();

  if (cJSON_IsString(body)) {
    try {
      char *encryptedBody = 0;
      size_t len = strlen(body->valuestring);
      uint8_t *text = reinterpret_cast<uint8_t *>(body->valuestring);
      int type = signal.encryptText(&encryptedBody, text, len, recipientId->valuestring, deviceId->valueint);
      if (type < 0) {
        throw std::invalid_argument(parseSignalError(type));
      }
      cJSON_AddStringToObject(response, "bodyEncrypted", encryptedBody);
      cJSON_AddNumberToObject(response, "bodyMessageType", type);
    } catch (exception &ex) {
      (void)[v = std::move(db)]{};
      spdlog::error("[{0}] ENCRYPT BODY ERROR {1}", endpointId, ex.what());
      sendError(conn, 500, ex.what());
      return 500;
    }
  }

  if (cJSON_IsString(preview)) {
    try {
      char *encryptedPreview = 0;
      size_t len = strlen(preview->valuestring);
      uint8_t *text = reinterpret_cast<uint8_t *>(preview->valuestring);
      int type = signal.encryptText(&encryptedPreview, text, len, recipientId->valuestring, deviceId->valueint);
      if (type < 0) {
        throw std::invalid_argument(parseSignalError(type));
      }
      cJSON_AddStringToObject(response, "previewEncrypted", encryptedPreview);
      cJSON_AddNumberToObject(response, "previewMessageType", type);
    } catch (exception &ex) {
      (void)[v = std::move(db)]{};
      spdlog::error("[{0}] ENCRYPT PREVIEW ERROR {1}", endpointId, ex.what());
      sendError(conn, 500, ex.what());
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
        uint8_t *text = reinterpret_cast<uint8_t *>(fileKey->valuestring);
        int result = signal.encryptText(&encryptedFileKey, text, len, recipientId->valuestring, deviceId->valueint);
        if (result < 0) {
          throw std::invalid_argument(parseSignalError(result));
        }
        cJSON *decryptedFileKey = cJSON_CreateString(encryptedFileKey);
        cJSON_AddItemToArray(myFileKeys, decryptedFileKey);
      } catch (exception &ex) {
        (void)[v = std::move(db)]{};
        spdlog::error("[{0}] ENCRYPT FILEKEYS ERROR {1}", endpointId, ex.what());
        sendError(conn, 500, ex.what());
        return 500;
      }
    }

    cJSON_AddItemToObject(response, "fileKeysEncrypted", myFileKeys);
  }

  (void)[v = std::move(db)]{};

  spdlog::info("[{0}] Successful response", endpointId);
  return SendJSON(conn, response);
}