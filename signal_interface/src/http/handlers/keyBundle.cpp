#include "keyBundle.h"

int createKeyBundle(struct mg_connection *conn, void *cbdata, char *dbPath, char *password) {
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }

  std::cout << "/keybundle Receiving Request" << std::endl;

  char buffer[1024];
  int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);

  if ((dlen < 1) || (dlen >= sizeof(buffer))) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }
  buffer[dlen] = 0;
  cJSON *obj = cJSON_Parse(buffer);
  
  if (obj == NULL) {
    mg_send_http_error(conn, 400, "%s", "Not a JSON String");
    return 400;
  }
  std::cout << "Request -> " << cJSON_Print(obj) << std::endl;

  cJSON *recipientId, *deviceId;
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");

  if (!cJSON_IsString(recipientId)) {
    mg_send_http_error(conn, 400, "%s", "Wrong data format");
    return 400;
  }

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(recipientId->valuestring, db, password);
  cJSON *bundle = cJSON_CreateObject();
  signal.generateKeyBundle(bundle, recipientId->valuestring);

  return SendJSON(conn, bundle);
}

int createAccount(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }

  std::cout << "/account Receiving Request" << std::endl;

  char buffer[1024];
  int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);

  if ((dlen < 1) || (dlen >= sizeof(buffer))) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }
  buffer[dlen] = 0;
  cJSON *obj = cJSON_Parse(buffer);
  
  if (obj == NULL) {
    mg_send_http_error(conn, 400, "%s", "Not a JSON String");
    return 400;
  }
  std::cout << "Request -> " << cJSON_Print(obj) << std::endl;

  cJSON *recipientId, *deviceId, *name;
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  name = cJSON_GetObjectItemCaseSensitive(obj, "name");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId) || !cJSON_IsString(name)) {
    mg_send_http_error(conn, 400, "%s", "Wrong data format");
    return 400;
  }

  char *publicKey;
  char *privKey;
  int regId;
  string myPassword = string(dbPath).find("Encrypt.db") != string::npos ? password : "";
  int result = CriptextSignal::createAccountCredentials(&publicKey, &privKey, &regId);
  result = CriptextDB::createAccount(string(dbPath), myPassword, recipientId->valuestring, name->valuestring, deviceId->valueint, publicKey, privKey, regId);

  if (result < 0) {
    mg_send_http_error(conn, 500, "%s", "Unable To Create Account");
    return -1;
  }

  mg_send_http_ok( conn, "text/plain", 4);
  mg_write(conn, "Done", 4);
  return 1;
}

int processKeyBundle(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }

  std::cout << "/session/create Receiving Request" << std::endl;

  string bufferData = parseBody(conn);
  int readLength = bufferData.length();

  if (readLength <= 0) {
    std::cout << "Receiving Request Fail 1" << std::endl;
    mg_send_http_error(conn, 400, "%s", "Request data too big");
    return 400;
  }
  
  cJSON *obj = cJSON_Parse(bufferData.c_str());
  
  if (obj == NULL) {
    mg_send_http_error(conn, 400, "%s", "Not a JSON String");
    return 400;
  }
  std::cout << "Request -> " << cJSON_Print(obj) << std::endl;

  cJSON *accountRecipientId, *keybundleArray;
  accountRecipientId = cJSON_GetObjectItemCaseSensitive(obj, "accountRecipientId");
  keybundleArray = cJSON_GetObjectItemCaseSensitive(obj, "keybundles");
  
  if (!cJSON_IsString(accountRecipientId) || !cJSON_IsArray(keybundleArray)) {
    mg_send_http_error(conn, 400, "%s", "Wrong Data");
    return 400;
  }

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(accountRecipientId->valuestring, db, password);
  cJSON *keyBundleObj = NULL;
  cJSON_ArrayForEach(keyBundleObj, keybundleArray) {

    cJSON *recipientId, *domain, *deviceId, *registrationId, *signedPreKeyId, *signedPreKey, *signature, *identityKey, *preKeyObj; 
    cJSON *preKeyId = 0; 
    cJSON *preKey = 0;

    recipientId = cJSON_GetObjectItemCaseSensitive(keyBundleObj, "recipientId");
    deviceId = cJSON_GetObjectItemCaseSensitive(keyBundleObj, "deviceId");
    registrationId = cJSON_GetObjectItemCaseSensitive(keyBundleObj, "registrationId");
    signedPreKeyId = cJSON_GetObjectItemCaseSensitive(keyBundleObj, "signedPreKeyId");
    signedPreKey = cJSON_GetObjectItemCaseSensitive(keyBundleObj, "signedPreKeyPublic");
    signature = cJSON_GetObjectItemCaseSensitive(keyBundleObj, "signedPreKeySignature");
    identityKey = cJSON_GetObjectItemCaseSensitive(keyBundleObj, "identityPublicKey");

    if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId) || !cJSON_IsNumber(registrationId) 
      || !cJSON_IsNumber(signedPreKeyId) || !cJSON_IsString(signedPreKey) || !cJSON_IsString(signature) 
      || !cJSON_IsString(identityKey)) {
      continue;
    }
    if (cJSON_HasObjectItem(keyBundleObj, "preKey")) {
      preKeyObj = cJSON_GetObjectItemCaseSensitive(keyBundleObj, "preKey");
      preKey = cJSON_GetObjectItemCaseSensitive(preKeyObj, "publicKey");
      preKeyId = cJSON_GetObjectItemCaseSensitive(preKeyObj, "id");
    }

    Keybundle kb = {
      .recipient_id = recipientId->valuestring,
      .device_id = deviceId->valueint,
      .registration_id = registrationId->valueint,
      .signed_prekey_id = signedPreKeyId->valueint,
      .signed_prekey_public = signedPreKey->valuestring,
      .signed_prekey_signature = signature->valuestring,
      .identity_public_key = identityKey->valuestring,
      .prekey_id = preKeyId != 0 ? preKeyId->valueint : 0,
      .prekey_public = preKey != 0 ? preKey->valuestring : 0,
    };
    signal.processKeyBundle(&kb);
  }

  mg_send_http_ok( conn, "text/plain", 0);
  mg_write(conn, "", 0);
  return 1;
}

int createPreKeys(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }

  std::cout << "/prekey Receiving Request" << std::endl;

  char buffer[1024];
  int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);

  if ((dlen < 1) || (dlen >= sizeof(buffer))) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }
  buffer[dlen] = 0;
  cJSON *obj = cJSON_Parse(buffer);
  
  if (obj == NULL) {
    mg_send_http_error(conn, 400, "%s", "Not a JSON String");
    return 400;
  }
  std::cout << "Request -> " << cJSON_Print(obj) << std::endl;

  cJSON *accountId;
  cJSON *newPreKeys;
  accountId = cJSON_GetObjectItemCaseSensitive(obj, "accountId");
  newPreKeys = cJSON_GetObjectItemCaseSensitive(obj, "newPreKeys");

  if (!cJSON_IsString(accountId) || !cJSON_IsArray(newPreKeys)) {
    mg_send_http_error(conn, 400, "%s", "Wrong data format");
    return 400;
  }

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(accountId->valuestring, db, password);
  cJSON *bundle = cJSON_CreateObject();
  signal.generateMorePreKeys(bundle, newPreKeys);
  return SendJSON(conn, bundle);
}