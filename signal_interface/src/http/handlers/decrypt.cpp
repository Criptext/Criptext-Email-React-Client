#include "decrypt.h"

int postDecryptEmail(struct mg_connection *conn, void *cbdata, char *dbPath, char *password) {
  int endpointId = rand() % 1000000;

  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  
  spdlog::info("[{0}] /decrypt Receiving Request", endpointId);
  string bufferData = parseBody(conn);
  int readLength = bufferData.length();

  if (readLength <= 0) {
    spdlog::error("[{0}] Request data too big", endpointId);
    mg_send_http_error(conn, 400, "%s", "Request data too big");
    return 400;
  }
  
  cJSON *obj = cJSON_Parse(bufferData.c_str());
  
  if (obj == NULL) {
    spdlog::error("[{0}] Not a json object: {1}", endpointId, bufferData);
    mg_send_http_error(conn, 400, "%s", bufferData.c_str());
    return 400;
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
    mg_send_http_error(conn, 400, "%s", "Missing params");
    return 400;
  }
  
  spdlog::info("[{0}] Request -> <RecipientId: {1}, senderId: {2}, EmailKey: {3}>", endpointId, recipientId->valuestring, senderId->valuestring, emailKey->valueint);
  
  CriptextSignal signal(recipientId->valuestring, dbPath, password);
  cJSON *response = cJSON_CreateObject();
  if (cJSON_IsString(body)) {
    try {
      uint8_t *plaintext_data = 0;
      size_t plaintext_len = 0;
      int result = signal.decryptText(&plaintext_data, &plaintext_len, body->valuestring, senderId->valuestring, deviceId->valueint, type->valueint);
      if (result < 0) {
        throw std::invalid_argument("Unable to decrypt message with error: " + result);
      }
      string text = std::string(plaintext_data, plaintext_data + plaintext_len);
      cJSON_AddStringToObject(response, "decryptedBody", text.c_str());
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
      string text = std::string(plaintext_data, plaintext_data + plaintext_len);
      cJSON_AddStringToObject(response, "decryptedHeaders", text.c_str());
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
        string text = std::string(plaintext_data, plaintext_data + plaintext_len);
        cJSON *decryptedFileKey = cJSON_CreateString(text.c_str());
        cJSON_AddItemToArray(myFileKeys, decryptedFileKey);
      } catch (exception &ex) {
        spdlog::error("[{0}] DECRYPT FILEKEY ERROR {1}", endpointId, ex.what());
        mg_send_http_error(conn, 500, "%s", "Unable to encrypt body");
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

  mg_send_http_ok( conn, "plain/text", encodedLen);
  mg_write(conn, encodedResponse, encodedLen);
  spdlog::info("[{0}] Successful response", endpointId);
  return 200;
  
}

int postDecryptKey(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  int endpointId = rand() % 1000000;
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  
  spdlog::info("[{0}] /decrypt/key Receiving Request", endpointId);

  string bufferData = parseBody(conn);
  int readLength = bufferData.length();

  if (readLength <= 0) {
    spdlog::error("[{0}] Request data too big", endpointId);
    mg_send_http_error(conn, 400, "%s", "Request data too big");
    return 400;
  }
  
  cJSON *obj = cJSON_Parse(bufferData.c_str());
  
  if (obj == NULL) {
    spdlog::error("[{0}] Not a json object: {1}", endpointId, bufferData);
    mg_send_http_error(conn, 400, "%s", bufferData.c_str());
    return 400;
  }

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

  CriptextSignal signal(recipientId->valuestring, dbPath, password);

  uint8_t *plaintext_data = 0;
  size_t plaintext_len = 0;
  int result = signal.decryptText(&plaintext_data, &plaintext_len, key->valuestring, recipientId->valuestring, deviceId->valueint, type->valueint);
  if (result < 0) {
    std::string unencrypted = "Content Unencrypted";
    spdlog::error("[{0}]  {1}", endpointId, unencrypted.c_str());
    mg_send_http_error(conn, 400, "%s", unencrypted.c_str());
    return 400;
  }

  mg_send_http_ok( conn, "application/octet-stream", plaintext_len);
  mg_write(conn, plaintext_data, plaintext_len);
  spdlog::info("[{0}] Successful response", endpointId);
  return 200;
}