#include "decrypt.h"

int postDecryptEmail(struct mg_connection *conn, void *cbdata, char *dbPath, char *password) {
  int endpointId = rand() % 1000000;

  bool corsResult = cors(conn);
  if (corsResult) {
    return 201;
  }

  if (password == 0) {
    sendError(conn, 401, "Missing Password Setup");
    return 401;
  }
  
  spdlog::info("[{0}] /decrypt Receiving Request", endpointId);
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

  cJSON *salt, *iv, *emailKey, *senderId, *deviceId, *type, *recipientId, *body, *headers, *fileKeys, *headersType;
  salt = cJSON_GetObjectItemCaseSensitive(obj, "salt");
  iv = cJSON_GetObjectItemCaseSensitive(obj, "iv");

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
    sendError(conn, 400, "Missing Params");
    return 400;
  }
  
  spdlog::info("[{0}] Request -> <RecipientId: {1}, senderId: {2}, EmailKey: {3}>", endpointId, recipientId->valuestring, senderId->valuestring, emailKey->valueint);
  
  database db = initializeDB(dbPath, password);
  CriptextSignal signal(recipientId->valuestring, db);
  cJSON *response = cJSON_CreateObject();
  if (cJSON_IsString(body)) {
    try {
      uint8_t *plaintext_data = 0;
      size_t plaintext_len = 0;
      int result = signal.decryptText(&plaintext_data, &plaintext_len, body->valuestring, senderId->valuestring, deviceId->valueint, type->valueint);
      if(result == -1001){
        spdlog::error("[{0}] DECRYPT BODY ERROR DUPLICATE MESSAGE", endpointId);
        sendError(conn, 409, "Duplicate Message");
        return 409;
      }
      else if (result < 0) {
        throw std::invalid_argument(parseSignalError(result));
      }
      string text = std::string(plaintext_data, plaintext_data + plaintext_len);
      cJSON_AddStringToObject(response, "decryptedBody", text.c_str());
    } catch (exception &ex) {
      spdlog::error("[{0}] DECRYPT BODY ERROR {1}", endpointId, ex.what());
      sendError(conn, 500, ex.what());
      return 500;
    }
  }

  if (cJSON_IsString(headers)) {
    try {
      uint8_t *plaintext_data = 0;
      size_t plaintext_len = 0;
      int result = signal.decryptText(&plaintext_data, &plaintext_len, headers->valuestring, senderId->valuestring, deviceId->valueint, headersType->valueint);
      if (result < 0) {
        throw std::invalid_argument(parseSignalError(result));
      }
      string text = std::string(plaintext_data, plaintext_data + plaintext_len);
      cJSON_AddStringToObject(response, "decryptedHeaders", text.c_str());
    } catch (exception &ex) {
      spdlog::error("[{0}] DECRYPT HEADER ERROR {1}", endpointId, ex.what());
      sendError(conn, 500, ex.what());
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
        if (result < 0) {
          throw std::invalid_argument(parseSignalError(result));
        }
        string text = std::string(plaintext_data, plaintext_data + plaintext_len);
        cJSON *decryptedFileKey = cJSON_CreateString(text.c_str());
        cJSON_AddItemToArray(myFileKeys, decryptedFileKey);
      } catch (exception &ex) {
        spdlog::error("[{0}] DECRYPT FILEKEY ERROR {1}", endpointId, ex.what());
        sendError(conn, 500, ex.what());
        return 500;
      }
    }

    cJSON_AddItemToObject(response, "decryptedFileKeys", myFileKeys);
  }
  
  if (!cJSON_IsString(salt) || !cJSON_IsString(iv)) {
    spdlog::info("[{0}] Successful response", endpointId);
    return SendJSON(conn, response);
  }
  
  char *myResponse = cJSON_PrintUnformatted(response);
  signal_buffer *myKey = 0;
  size_t saltLen = 0;
  const uint8_t *mySalt =  base64_decode(reinterpret_cast<unsigned char *>(salt->valuestring), strlen(salt->valuestring), &saltLen);
  size_t ivLen = 0;
  const uint8_t *myIv =  base64_decode(reinterpret_cast<unsigned char *>(iv->valuestring), strlen(iv->valuestring), &ivLen);
  int result = deriveKey(&myKey, mySalt, saltLen, password, strlen(password));

  signal_buffer *encryptedResponse = 0;
  result = encrypth(&encryptedResponse, 2, myKey->data, myKey->len, myIv, ivLen, reinterpret_cast<uint8_t *>(myResponse), strlen(myResponse), 0);

  size_t encodedLen = 0;
  unsigned char *encodedResponse = base64_encode(reinterpret_cast<unsigned char *>(signal_buffer_data(encryptedResponse)), signal_buffer_len(encryptedResponse), &encodedLen);

  signal_buffer_free(myKey);

  sendOK(conn, string(reinterpret_cast<char*>(encodedResponse)));
  spdlog::info("[{0}] Successful response", endpointId);
  return 200;
  
}

int postDecryptKey(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  int endpointId = rand() % 1000000;
  bool corsResult = cors(conn);
  if (corsResult) {
    return 201;
  }

  if (password == 0) {
    sendError(conn, 401, "Missing Password Setup");
    return 401;
  }
  
  spdlog::info("[{0}] /decrypt/key Receiving Request", endpointId);

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

  cJSON *deviceId, *type, *recipientId, *key;
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  type = cJSON_GetObjectItemCaseSensitive(obj, "messageType");
  key = cJSON_GetObjectItemCaseSensitive(obj, "key");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId) || !cJSON_IsNumber(type)) {
    spdlog::error("[{0}]  Missing Params", endpointId);
    sendError(conn, 400, "Missing Params");
    return 400;
  }

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(recipientId->valuestring, db);

  uint8_t *plaintext_data = 0;
  size_t plaintext_len = 0;
  int result = signal.decryptText(&plaintext_data, &plaintext_len, key->valuestring, recipientId->valuestring, deviceId->valueint, type->valueint);
  if (result < 0) {
    spdlog::error("[{0}] DECRYPT KEY ERROR {1}", endpointId, parseSignalError(result));
    sendError(conn, 500, parseSignalError(result));
    return 500;
  }

  sendBytes(conn, plaintext_data, plaintext_len);
  spdlog::info("[{0}] Successful response", endpointId);
  return 200;
}