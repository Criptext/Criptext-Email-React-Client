#include "signal.h"
#include <string>
#include <iostream>

CriptextSignal::CriptextSignal(int accountId){
    signal_context_create(&global_context, 0);
    signal_crypto_provider provider = {
        .random_func = random_generator,
        .hmac_sha256_init_func = hmac_sha256_init,
        .hmac_sha256_update_func = hmac_sha256_update,
        .hmac_sha256_final_func = hmac_sha256_final,
        .hmac_sha256_cleanup_func = hmac_sha256_cleanup,
        .sha512_digest_init_func = sha512_digest_init,
        .sha512_digest_update_func = sha512_digest_update,
        .sha512_digest_final_func = sha512_digest_final,
        .sha512_digest_cleanup_func = sha512_digest_cleanup,
        .encrypt_func = encrypth,
        .decrypt_func = decrypt,
        .user_data = 0
    };

    signal_context_set_crypto_provider(global_context, &provider);
    try {
        account = CriptextDB::getAccount("Criptext.db", accountId);
    } catch (exception &e) {
        return;
    }
    setup_store_context(&store, global_context, &account);
}

int CriptextSignal::decryptText(uint8_t **plaintext_data, size_t *plaintext_len, std::string encryptedText, std::string recipientId, int deviceId, int message_type){

    int result;

    signal_protocol_address address = {
        .name = recipientId.c_str(),
        .name_len = recipientId.length(),
        .device_id = deviceId
    };

    session_cipher *session_cipher = 0;
    result = session_cipher_create(&session_cipher, store, &address, global_context);
    std::cout << result << std::endl;
    size_t decode_len = 0;
    const unsigned char *encryptedCText = reinterpret_cast<const unsigned char*>(encryptedText.c_str());
    unsigned char* textFromB64 = base64_decode(encryptedCText, strlen((char *)encryptedCText), &decode_len);

    try {
        if (message_type == 1) {
            const uint8_t *messageData = reinterpret_cast<const uint8_t*>(textFromB64);
            signal_message *incoming_message = 0;
            signal_message_deserialize(&incoming_message, messageData, sizeof(messageData), global_context);
            signal_buffer *plainMessage = 0;
            session_cipher_decrypt_signal_message(session_cipher, incoming_message, 0, &plainMessage);
            return 0;
        } else {
            const uint8_t *preKeyMessageData = reinterpret_cast<const uint8_t*>(textFromB64);
            pre_key_signal_message *incoming_message = 0;
            pre_key_signal_message_deserialize(&incoming_message, preKeyMessageData, decode_len, global_context);
            signal_buffer *plainMessage = 0;
            session_cipher_decrypt_pre_key_signal_message(session_cipher, incoming_message, 0, &plainMessage);

            uint8_t *data = signal_buffer_data(plainMessage);
            size_t len = signal_buffer_len(plainMessage);

            std::cout << "Message :  " << data << " - size: " << len << std::endl;

            *plaintext_data = data;
            *plaintext_len = len;
             
            return 0;
        }
    } catch(exception &ex) {
        return -1;
    }
}

int CriptextSignal::generatePreKey(cJSON *preKeyJson, int index) {

    ec_key_pair *preKeyPair = 0;
    int result = curve_generate_key_pair(global_context, &preKeyPair);

    session_pre_key *preKeySession = 0;
    session_pre_key_create(&preKeySession, index, preKeyPair);

    signal_buffer *buffer = 0;
    uint32_t id = 0;

    session_pre_key_serialize(&buffer, preKeySession);

    ec_public_key *publicKey = preKeySession->key_pair->public_key;
    signal_buffer *publicKeyBuffer = 0;
    ec_public_key_serialize(&publicKeyBuffer, publicKey);
    uint8_t *publicData = signal_buffer_data(publicKeyBuffer);
    size_t publicLen = signal_buffer_len(publicKeyBuffer);
    const unsigned char *publicChar = reinterpret_cast<const unsigned char*>(publicData);

    size_t publicEncodeLen = 0;
    const char * publicB64 = reinterpret_cast<const char *>(base64_encode(publicChar, publicLen, &publicEncodeLen));

    store->pre_key_store.store_pre_key(index, signal_buffer_data(buffer), signal_buffer_len(buffer), store->pre_key_store.user_data);
    cJSON_AddStringToObject(preKeyJson, "public", publicB64);
	cJSON_AddNumberToObject(preKeyJson, "id", index);

    return 0;
}

int generateBundle(cJSON *bundle, int registrationId, char *signedPreKeySignature, char *signedPreKeyPublic, int signedPreKeyId, char *identityPublicKey, cJSON *preKeys) {

    cJSON_AddStringToObject(bundle, "signedPreKeySignature", signedPreKeySignature);
    cJSON_AddStringToObject(bundle, "signedPreKeyPublic", signedPreKeyPublic);
    cJSON_AddNumberToObject(bundle, "signedPreKeyId", signedPreKeyId);
    cJSON_AddItemToObject(bundle, "preKeys", preKeys);
    cJSON_AddStringToObject(bundle, "identityPublicKey", identityPublicKey);
	cJSON_AddNumberToObject(bundle, "registrationId", registrationId);

    return 0;
}

int CriptextSignal::createSignedPrekey(char **encodedSignedPublicPreKey, char **encodedSignature, ec_private_key *identityPrivateKey) {
    int result = 0;
    ec_key_pair *signedPreKeyPair = 0;
    result = curve_generate_key_pair(global_context, &signedPreKeyPair);

    signal_buffer *serializedSignedPublicPreKey = 0;
    result = ec_public_key_serialize(&serializedSignedPublicPreKey,
            ec_key_pair_get_public(signedPreKeyPair));
    signal_buffer *signedPreKeySignature = 0;
    result = curve_calculate_signature(global_context,
            &signedPreKeySignature,
            identityPrivateKey,
            signal_buffer_data(serializedSignedPublicPreKey),
            signal_buffer_len(serializedSignedPublicPreKey));
    session_signed_pre_key *sessionSignedPreKey = 0;
    session_signed_pre_key_create(&sessionSignedPreKey, 1, time(0), signedPreKeyPair, signal_buffer_data(signedPreKeySignature), signal_buffer_len(signedPreKeySignature));
    signal_buffer *serializedSignedPreKeySession = 0;
    session_signed_pre_key_serialize(&serializedSignedPreKeySession, sessionSignedPreKey);
    store->signed_pre_key_store.store_signed_pre_key(1, signal_buffer_data(serializedSignedPreKeySession), signal_buffer_len(serializedSignedPreKeySession), &account);
    size_t *len = 0;
    unsigned char *signedPublicPreKeyEncoded = base64_encode(reinterpret_cast<const unsigned char *>(signal_buffer_data(serializedSignedPublicPreKey)), signal_buffer_len(serializedSignedPublicPreKey), len);
    unsigned char *signatureEncoded = base64_encode(reinterpret_cast<const unsigned char *>(signal_buffer_data(serializedSignedPreKeySession)), signal_buffer_len(serializedSignedPreKeySession), len);

    *encodedSignedPublicPreKey = reinterpret_cast<char *>(signedPublicPreKeyEncoded);
    *encodedSignature = reinterpret_cast<char *>(signatureEncoded);
    signal_buffer_free(signedPreKeySignature);
    signal_buffer_free(serializedSignedPublicPreKey);
    return result;
}

int CriptextSignal::generateKeyBundle(cJSON *bundle, string recipientId, int deviceId, int accountId) {
    int result = 0;

    ec_private_key *identityPrivateKey = 0;
    uint8_t *identityPrivKeyBytes = reinterpret_cast<uint8_t *>(&account.privKey);
    curve_decode_private_point(&identityPrivateKey, identityPrivKeyBytes, 32, 0);
    std::cout << identityPrivateKey << std::endl; 
    char *signedPublicPreKeyEncoded = 0;
    char *signatureEncoded = 0;
    createSignedPrekey(&signedPublicPreKeyEncoded, &signatureEncoded, identityPrivateKey);
    cJSON *preKeysArray = cJSON_CreateArray();
    for( int index = 1; index <= 100; index++ ) {
        cJSON *preKeyObject = cJSON_CreateObject();
        generatePreKey(preKeyObject, index);
        cJSON_AddItemToArray(preKeysArray, preKeyObject);
    }
    
    size_t pubLen = 0;
    char *identityPublicKey = reinterpret_cast<char *>(base64_encode(reinterpret_cast<const unsigned char *>(account.pubKey.c_str()), 32, &pubLen));
    generateBundle(bundle, account.registrationId, signatureEncoded, signedPublicPreKeyEncoded, 1, identityPublicKey, preKeysArray);
    return 0;
}

void CriptextSignal::clean() {
    signal_context_destroy(global_context);
    signal_protocol_store_context_destroy(store);
}