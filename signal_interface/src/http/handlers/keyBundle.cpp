#include "keyBundle.h"
#include <string>
#include <iostream>
#include <signal/session_pre_key.h>
#include "../../crypto/signal.h"

int cors(struct mg_connection *conn) {
  const struct mg_request_info *ri = mg_get_request_info(conn);
  mg_printf(conn,
      "HTTP/1.1 200 OK\r\n"
      "Access-Control-Allow-Origin: *\r\n"
      "Access-Control-Allow-Methods: *\r\n",
      "Access-Control-Allow-Headers: *\r\n");
  if (!strcmp(ri->request_method, "OPTIONS")) {
    return -1;
  }
  return 0;
}

int SendJSON(struct mg_connection *conn, cJSON *json_obj) {
	char *json_str = cJSON_PrintUnformatted(json_obj);
	size_t json_str_len = strlen(json_str);

	mg_send_http_ok(conn, "application/json; charset=utf-8", json_str_len);
	mg_write(conn, json_str, json_str_len);

	cJSON_free(json_str);
	return (int)json_str_len;
}

int createKeyBundle(struct mg_connection *conn, void *cbdata) {
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

  cJSON *recipientId, *deviceId;
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    std::cout << "Receiving Request Fail 3" << std::endl;
    return 400;
  }

  CriptextSignal signal(recipientId->valuestring);
  cJSON *bundle = cJSON_CreateObject();
  signal.generateKeyBundle(bundle, recipientId->valuestring, deviceId->valueint);

  return SendJSON(conn, bundle);
}

int createAccount(struct mg_connection *conn, void *cbdata) {
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

  cJSON *recipientId, *deviceId, *name;
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  name = cJSON_GetObjectItemCaseSensitive(obj, "name");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId) || !cJSON_IsString(name)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    std::cout << "Receiving Request Fail 3" << std::endl;
    return 400;
  }

  char *publicKey;
  char *privKey;
  int regId;
  int result = CriptextSignal::createAccountCredentials(&publicKey, &privKey, &regId);
  std::cout << publicKey << std::endl;
  result = CriptextDB::createAccount("../../electron_app/Criptext.db", recipientId->valuestring, name->valuestring, deviceId->valueint, publicKey, privKey, regId);

  if (result < 0) {
    std::string unencrypted = "Failure";
    mg_send_http_ok( conn, "text/plain", strlen(unencrypted.c_str()));
    mg_write(conn, unencrypted.c_str(), strlen(unencrypted.c_str()));
    return -1;
  }

  mg_send_http_ok( conn, "text/plain", 4);
  mg_write(conn, "Done", 4);
  return 1;
}