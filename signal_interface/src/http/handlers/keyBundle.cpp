#include "keyBundle.h"

int createKeyBundle(struct mg_connection *conn, void *cbdata, char *dbPath, char *password) {
  bool corsResult = cors(conn);
  if (corsResult) {
    return 201;
  }

  std::cout << "/keybundle Receiving Request" << std::endl;

  if (password == 0) {
    sendError(conn, 401, "Missing Password Setup");
    return 401;
  }

  char buffer[1024];
  int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);

  if ((dlen < 1) || (dlen >= (int)sizeof(buffer))) {
    sendError(conn, 400, "Empty Request");
    return 400;
  }
  buffer[dlen] = 0;
  cJSON *obj = cJSON_Parse(buffer);
  
  if (obj == NULL) {
    sendError(conn, 422, "Not a JSON Object");
    return 422;
  }

  cJSON *recipientId;
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");

  if (!cJSON_IsString(recipientId)) {
    sendError(conn, 400, "Missing Params");
    return 400;
  }

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(recipientId->valuestring, db);
  cJSON *bundle = cJSON_CreateObject();
  signal.generateKeyBundle(bundle, recipientId->valuestring);

  return SendJSON(conn, bundle);
}

int createAccount(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  bool corsResult = cors(conn);
  if (corsResult) {
    return 201;
  }

  std::cout << "/account Receiving Request" << std::endl;

  if (password == 0) {
    sendError(conn, 401, "Missing Password Setup");
    return 401;
  }

  char buffer[1024];
  int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);

  if ((dlen < 1) || (dlen >= (int)sizeof(buffer))) {
    sendError(conn, 400, "Empty Request");
    return 400;
  }
  buffer[dlen] = 0;
  cJSON *obj = cJSON_Parse(buffer);
  
  if (obj == NULL) {
    sendError(conn, 422, "Not a JSON Object");
    return 422;
  }

  cJSON *recipientId, *deviceId, *name;
  recipientId = cJSON_GetObjectItemCaseSensitive(obj, "recipientId");
  deviceId = cJSON_GetObjectItemCaseSensitive(obj, "deviceId");
  name = cJSON_GetObjectItemCaseSensitive(obj, "name");

  if (!cJSON_IsString(recipientId) || !cJSON_IsNumber(deviceId) || !cJSON_IsString(name)) {
    sendError(conn, 400, "Missing Params");
    return 400;
  }

  char *publicKey;
  char *privKey;
  int regId;
  int result = CriptextSignal::createAccountCredentials(&publicKey, &privKey, &regId);
  database db = initializeDB(dbPath, password);
  result = CriptextDB::createAccount(db, recipientId->valuestring, name->valuestring, deviceId->valueint, publicKey, privKey, regId);

  if (result < 0) {
    sendError(conn, 500, "Unable to Create Account");
    return 500;
  }

  sendOK(conn, "Done");
  return 1;
}

int processKeyBundle(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  bool corsResult = cors(conn);
  if (corsResult) {
    return 201;
  }

  std::cout << "/session/create Receiving Request" << std::endl;

  if (password == 0) {
    sendError(conn, 401, "Missing Password Setup");
    return 401;
  }

  string bufferData = parseBody(conn);
  int readLength = bufferData.length();

  if (readLength <= 0) {
    sendError(conn, 413, "Request Data Too Big");
    return 413;
  }
  
  cJSON *obj = cJSON_Parse(bufferData.c_str());
  
  if (obj == NULL) {
    sendError(conn, 422, "Not a JSON Object");
    return 422;
  }

  cJSON *accountRecipientId, *keybundleArray;
  accountRecipientId = cJSON_GetObjectItemCaseSensitive(obj, "accountRecipientId");
  keybundleArray = cJSON_GetObjectItemCaseSensitive(obj, "keybundles");
  
  if (!cJSON_IsString(accountRecipientId) || !cJSON_IsArray(keybundleArray)) {
    sendError(conn, 400, "Missing Params");
    return 400;
  }

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(accountRecipientId->valuestring, db);
  cJSON *keyBundleObj = NULL;
  cJSON_ArrayForEach(keyBundleObj, keybundleArray) {

    cJSON *recipientId, *deviceId, *registrationId, *signedPreKeyId, *signedPreKey, *signature, *identityKey, *preKeyObj; 
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

  sendOK(conn, "");
  return 1;
}

int createPreKeys(struct mg_connection *conn, void *cbdata, char *dbPath, char* password) {
  bool corsResult = cors(conn);
  if (corsResult) {
    return 201;
  }

  std::cout << "/prekey Receiving Request" << std::endl;

  if (password == 0) {
    sendError(conn, 401, "Missing Password Setup");
    return 401;
  }

  char buffer[1024];
  int dlen = mg_read(conn, buffer, sizeof(buffer) - 1);

  if ((dlen < 1) || (dlen >= (int)sizeof(buffer))) {
    sendError(conn, 400, "Empty Request");
    return 400;
  }
  buffer[dlen] = 0;
  cJSON *obj = cJSON_Parse(buffer);
  
  if (obj == NULL) {
    sendError(conn, 422, "Not a JSON String");
    return 422;
  }

  cJSON *accountId;
  cJSON *newPreKeys;
  accountId = cJSON_GetObjectItemCaseSensitive(obj, "accountId");
  newPreKeys = cJSON_GetObjectItemCaseSensitive(obj, "newPreKeys");

  if (!cJSON_IsString(accountId) || !cJSON_IsArray(newPreKeys)) {
    sendError(conn, 400, "Missing Params");
    return 400;
  }

  database db = initializeDB(dbPath, password);
  CriptextSignal signal(accountId->valuestring, db);
  cJSON *bundle = cJSON_CreateObject();
  signal.generateMorePreKeys(bundle, newPreKeys);
  return SendJSON(conn, bundle);
}