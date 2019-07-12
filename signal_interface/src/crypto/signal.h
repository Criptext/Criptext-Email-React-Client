#ifndef SIGNAL_H
#define SIGNAL_H

#include <string>
#include <iostream>
#include <signal/session_builder.h>
#include <signal/session_cipher.h>
#include <signal/protocol.h>
#include <cjson/cJSON.h>
#include "./protocol_store/types.h"

#include "store.h"
extern "C" {
    #include "crypto.h"
    #include "base64.h"
}

class CriptextSignal {

    CriptextDB::Account account;
    signal_context* global_context;
    signal_protocol_store_context* store;

    private :
        int createSignedPrekey(char **encodedSignedPublicPreKey, char **encodedSignature, ec_private_key *identityPrivateKey);
        int generatePreKey(cJSON *preKeyJson, int index);

    public :
        CriptextSignal(char *recipientId);
        int decryptText(uint8_t **plaintext_data, size_t *plaintext_len, std::string encryptedText, std::string recipientId, int deviceId, int message_type);
        int generateKeyBundle(cJSON *bundle, string recipientId, int deviceId);

        void clean();

    static int createAccountCredentials(char **publicKey, char **privKey, int *regId) {
        signal_context* global_context = 0;
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
            .encrypt_func = 0,
            .decrypt_func = 0,
            .user_data = 0
        };
        signal_context_create(&global_context, 0);
        signal_context_set_crypto_provider(global_context, &provider);
        ec_key_pair *identity_key_pair_keys = 0;
        curve_generate_key_pair(global_context, &identity_key_pair_keys);
        ec_public_key *identity_key_public = ec_key_pair_get_public(identity_key_pair_keys);
        ec_private_key *identity_key_private = ec_key_pair_get_private(identity_key_pair_keys);
        signal_buffer *publickKeySerialized = 0;
        signal_buffer *privKeySerialized = 0;
        ec_public_key_serialize(&publickKeySerialized, identity_key_public);
        ec_private_key_serialize(&privKeySerialized, identity_key_private);
        SIGNAL_UNREF(identity_key_pair_keys);
        std::cout << publickKeySerialized->data << std::endl;
        int local_registration_id = (rand() % 16380) + 1;

        char *publicKeyChar = reinterpret_cast<char *>(signal_buffer_data(publickKeySerialized));
        *publicKey = publicKeyChar;
        std::cout << publicKey << std::endl;
        char *privKeyChar = reinterpret_cast<char *>(signal_buffer_data(privKeySerialized));
        *privKey = privKeyChar;
        *regId = local_registration_id;
        return 0;
    }
};

#endif