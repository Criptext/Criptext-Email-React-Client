#include "password.h"

string decryptPassword(struct mg_connection *conn, void *cbdata, char* token, string currentPassword) {
  int endpointId = rand() % 1000000;
  bool corsResult = cors(conn);
  if (corsResult) {
    return "";
  }
  spdlog::info("[{0}] /password/set Receiving Request", endpointId);
  string bufferData = parseBody(conn);
  int readLength = bufferData.length();

  if (readLength <= 0) {
    spdlog::error("[{0}] Request data too big", endpointId);
    sendError(conn, 413, "Request Data Too Big");
    return "";
  }

  cJSON *requestObj = cJSON_Parse(bufferData.c_str());
  
  if (requestObj == NULL) {
    spdlog::error("[{0}] Not a json object: {1}", endpointId, bufferData);
    sendError(conn, 422, bufferData);
    return "";
  }

  cJSON *salt, *iv, *content;
  salt = cJSON_GetObjectItemCaseSensitive(requestObj, "salt");
  iv = cJSON_GetObjectItemCaseSensitive(requestObj, "iv");
  content = cJSON_GetObjectItemCaseSensitive(requestObj, "password");

  signal_buffer *myKey = 0;
  size_t saltLen = 0;
  const uint8_t *mySalt =  base64_decode(reinterpret_cast<unsigned char *>(salt->valuestring), strlen(salt->valuestring), &saltLen);
  size_t ivLen = 0;
  const uint8_t *myIv =  base64_decode(reinterpret_cast<unsigned char *>(iv->valuestring), strlen(iv->valuestring), &ivLen);
  int result = deriveKey(&myKey, mySalt, saltLen, token, strlen(token));
  size_t decodeLen = 0;
  const uint8_t *decodedRequest =  base64_decode(reinterpret_cast<unsigned char *>(content->valuestring), strlen(content->valuestring), &decodeLen);
  signal_buffer *decryptedPassword = 0;
  result = decrypt(&decryptedPassword, 2, myKey->data, myKey->len, myIv, ivLen, decodedRequest, decodeLen, 0);
  signal_buffer_free(myKey);

  if (result < 0) {
    sendError(conn, 500, "Unable to set password");
    return "";
  }
  
  string password = string(reinterpret_cast<char *>(decryptedPassword->data), decryptedPassword->len);
  if (!currentPassword.empty() && currentPassword.compare(password) != 0) {
    sendError(conn, 401, "Passwords do not match");
  }

  mg_send_http_ok(conn, "text/plain", 5);
	mg_write(conn, "Done\n", 5);
  return password;
}