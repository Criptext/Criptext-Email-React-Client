#include "signal.h"
#include <string>
#include <iostream>

std::recursive_mutex global_mutex;

void lock_fn(void *user_data){
    global_mutex.lock();
}

void unlock_fn(void *user_data){
    global_mutex.unlock();
}

CriptextSignal::CriptextSignal(char *recipientId, database db){
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
    signal_context_set_locking_functions(global_context, lock_fn, unlock_fn);
    try {
        account = CriptextDB::getAccount(db, recipientId);
    } catch (exception &e) {
        std::cout << "ERROR INITIALIZING SIGNAL : " << e.what() << std::endl;
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
    size_t decode_len = 0;
    const unsigned char *encryptedCText = reinterpret_cast<const unsigned char*>(encryptedText.c_str());
    unsigned char* textFromB64 = base64_decode(encryptedCText, strlen((char *)encryptedCText), &decode_len);

    try {
        signal_buffer *plainMessage = 0;

        if (message_type == 1) {
            const uint8_t *messageData = reinterpret_cast<const uint8_t*>(textFromB64);
            signal_message *incoming_message = 0;
            signal_message_deserialize(&incoming_message, messageData, decode_len, global_context);
            if (incoming_message == 0) {
                return -1300;
            }
            result = session_cipher_decrypt_signal_message(session_cipher, incoming_message, 0, &plainMessage);
        } else {
            const uint8_t *preKeyMessageData = reinterpret_cast<const uint8_t*>(textFromB64);
            pre_key_signal_message *incoming_message = 0;
            pre_key_signal_message_deserialize(&incoming_message, preKeyMessageData, decode_len, global_context);
            if (incoming_message == 0) {
                return -1300;
            }
            result = session_cipher_decrypt_pre_key_signal_message(session_cipher, incoming_message, 0, &plainMessage);
        }

        if (result < 0) {
            return result;
        }

        uint8_t *data = signal_buffer_data(plainMessage);
        size_t len = signal_buffer_len(plainMessage);

        *plaintext_data = data;
        *plaintext_len = len;

        return 0;
    } catch(exception &ex) {
        return -1;
    }
}

int CriptextSignal::generatePreKey(cJSON *preKeyJson, int index) {

    ec_key_pair *preKeyPair = 0;
    curve_generate_key_pair(global_context, &preKeyPair);

    session_pre_key *preKeySession = 0;
    session_pre_key_create(&preKeySession, index, preKeyPair);

    signal_buffer *buffer = 0;

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
    cJSON_AddStringToObject(preKeyJson, "publicKey", publicB64);
	cJSON_AddNumberToObject(preKeyJson, "id", index);

    return 0;
}

int generateBundle(cJSON *bundle, int registrationId, char *signedPreKeySignature, char *signedPreKeyPublic, int signedPreKeyId, const char *identityPublicKey, cJSON *preKeys) {

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
    session_signed_pre_key_create(&sessionSignedPreKey, 1, 100000, signedPreKeyPair, signal_buffer_data(signedPreKeySignature), signal_buffer_len(signedPreKeySignature));
    signal_buffer *serializedSignedPreKeySession = 0;
    session_signed_pre_key_serialize(&serializedSignedPreKeySession, sessionSignedPreKey);
    store->signed_pre_key_store.store_signed_pre_key(1, signal_buffer_data(serializedSignedPreKeySession), signal_buffer_len(serializedSignedPreKeySession), &account);
    size_t *len = 0;
    unsigned char *signedPublicPreKeyEncoded = base64_encode(reinterpret_cast<const unsigned char *>(signal_buffer_data(serializedSignedPublicPreKey)), signal_buffer_len(serializedSignedPublicPreKey), len);
    unsigned char *signatureEncoded = base64_encode(reinterpret_cast<const unsigned char *>(signal_buffer_data(signedPreKeySignature)), signal_buffer_len(signedPreKeySignature), len);

    *encodedSignedPublicPreKey = reinterpret_cast<char *>(signedPublicPreKeyEncoded);
    *encodedSignature = reinterpret_cast<char *>(signatureEncoded);
    signal_buffer_free(signedPreKeySignature);
    signal_buffer_free(serializedSignedPublicPreKey);
    return result;
}

int CriptextSignal::generateKeyBundle(cJSON *bundle, string recipientId) {
    int result = 0;

    ec_private_key *identityPrivateKey = 0;

    size_t privLen = 0;
    const unsigned char *identityKeyPriv = reinterpret_cast<const unsigned char *>(account.privKey.c_str());
    uint8_t *myPrivRecord = reinterpret_cast<uint8_t *>(base64_decode(identityKeyPriv, account.privKey.length(), &privLen));    

    result = curve_decode_private_point(&identityPrivateKey, myPrivRecord, privLen, 0);
    char *signedPublicPreKeyEncoded = 0;
    char *signatureEncoded = 0;
    createSignedPrekey(&signedPublicPreKeyEncoded, &signatureEncoded, identityPrivateKey);
    cJSON *preKeysArray = cJSON_CreateArray();
    for( int index = 1; index <= 100; index++ ) {
        cJSON *preKeyObject = cJSON_CreateObject();
        generatePreKey(preKeyObject, index);
        cJSON_AddItemToArray(preKeysArray, preKeyObject);
    }

    generateBundle(bundle, account.registrationId, signatureEncoded, signedPublicPreKeyEncoded, 1, account.pubKey.c_str(), preKeysArray);
    return 0;
}

int CriptextSignal::generateMorePreKeys(cJSON *bundle, cJSON *newPreKeys) {
    
    cJSON *preKeysArray = cJSON_CreateArray();
    cJSON *preKeyId = NULL;
    cJSON_ArrayForEach(preKeyId, newPreKeys) {
        cJSON *preKeyObject = cJSON_CreateObject();
        generatePreKey(preKeyObject, preKeyId->valueint);
        cJSON_AddItemToArray(preKeysArray, preKeyObject);
    }

    cJSON_AddItemToObject(bundle, "preKeys", preKeysArray);
    return 0;
}

void CriptextSignal::clean() {
    signal_context_destroy(global_context);
    signal_protocol_store_context_destroy(store);
}

void CriptextSignal::processKeyBundle(struct Keybundle* kb){
    size_t decode_len = 0;
    
    ec_public_key* publicPreKey = 0;
    
    if (kb->prekey_public != 0) {
        const unsigned char *preKeyBase64 = reinterpret_cast<unsigned char *>(kb->prekey_public);
        const uint8_t *publicKey =  reinterpret_cast<uint8_t *>(base64_decode(preKeyBase64, strlen(kb->prekey_public), &decode_len));
        curve_decode_point(&publicPreKey, publicKey, decode_len, global_context);
    }

    ec_public_key* publicSignedPreKey = 0;
    const unsigned char *signedPreKeyBase64 = reinterpret_cast<unsigned char *>(kb->signed_prekey_public);
    const uint8_t *publicSignedKey =  reinterpret_cast<uint8_t *>(base64_decode(signedPreKeyBase64, strlen(kb->signed_prekey_public), &decode_len));
    curve_decode_point(&publicSignedPreKey, publicSignedKey, decode_len, global_context);

    ec_public_key* publicIdentityKey = 0;
    const unsigned char *identityKeyBase64 = reinterpret_cast<unsigned char *>(kb->identity_public_key);
    const uint8_t *publicIdKey =  reinterpret_cast<uint8_t *>(base64_decode(identityKeyBase64, strlen(kb->identity_public_key), &decode_len));
    curve_decode_point(&publicIdentityKey, publicIdKey, decode_len, global_context);

    const unsigned char *signatureBase64 = reinterpret_cast<unsigned char *>(kb->signed_prekey_signature);
    const uint8_t *signature =  reinterpret_cast<uint8_t *>(base64_decode(signatureBase64, strlen(kb->signed_prekey_signature), &decode_len));

    /* Create a correct pre key bundle */
    session_pre_key_bundle* pre_key_bundle = 0;
    int result = session_pre_key_bundle_create(&pre_key_bundle,
        kb->registration_id,
        kb->device_id, /* device ID */
        kb->prekey_id, /* pre key ID */
        publicPreKey,
        kb->signed_prekey_id, /* signed pre key ID */
        publicSignedPreKey,
        signature,
        64,
        publicIdentityKey);
    
    //create name
    signal_protocol_address address = {
        .name = kb->recipient_id,
        .name_len = strlen(kb->recipient_id),
        .device_id = kb->device_id
    };

    session_builder* session_builder = 0;
    result = session_builder_create(&session_builder, store, &address, global_context);
    result = session_builder_process_pre_key_bundle(session_builder, pre_key_bundle);
    session_builder_free(session_builder);
}

int CriptextSignal::encryptText(char **encryptedText, uint8_t *plainText, size_t plainTextLength, char* recipientId, int deviceId) {
    int result;

    signal_protocol_address address = {
        .name = recipientId,
        .name_len = strlen(recipientId),
        .device_id = deviceId
    };

    try {
        
        session_cipher *session_cipher = 0;
        ciphertext_message *encryptedMessage = 0;
        result = session_cipher_create(&session_cipher, store, &address, global_context);
        result = session_cipher_encrypt(session_cipher, plainText, plainTextLength, &encryptedMessage);
                
        if (result < 0) {
            std::cout << "Unable to encrypt : " << result << std::endl;
            return result;
        }

        size_t len = 0;
        int messageType = ciphertext_message_get_type(encryptedMessage);
        messageType = messageType == 2 ? 1 : messageType;
        signal_buffer *outgoing_serialized = ciphertext_message_get_serialized(encryptedMessage);
        const unsigned char *text = reinterpret_cast<const unsigned char *>(signal_buffer_data(outgoing_serialized));
        char *encodedText = reinterpret_cast<char *>(base64_encode(text, signal_buffer_len(outgoing_serialized), &len));

        session_cipher_free(session_cipher);
        SIGNAL_UNREF(encryptedMessage);

        *encryptedText = encodedText;
        return messageType;
    } catch (exception &e) {
        std::cout << "Error Encrypting : " << e.what() << std::endl;
        return -1;
    }

    return -1;
}