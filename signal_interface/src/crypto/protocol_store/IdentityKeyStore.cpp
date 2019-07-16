#include "IdentityKeyStore.h"
#include "../store.h"
#include "../uthash.h"
#include <string>
#include <vector>
#include <iostream>

int identity_key_store_get_identity_key_pair(signal_buffer **public_data, signal_buffer **private_data, void *user_data)
{
    std::cout << "GET IDENTITY KEY PAIR" << std::endl;
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;

    size_t pubDecodeLen = 33;
    const uint8_t *pubKeyData = reinterpret_cast<uint8_t *>(&account->pubKey);
    size_t privDecodeLen = 32;
    const uint8_t *privKeyData = reinterpret_cast<uint8_t *>(&account->privKey);;
    
    signal_buffer *pubKeyBuffer = signal_buffer_create(pubKeyData, pubDecodeLen);
    signal_buffer *privKeyBuffer = signal_buffer_create(privKeyData, privDecodeLen);

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

    ec_public_key *key;
    int decoded = curve_decode_point(&key, signal_buffer_data(pubKeyBuffer), signal_buffer_len(pubKeyBuffer), global_context);

    std::cout << "DECODED : " << pubKeyBuffer->data[0] << std::endl;

    *public_data = pubKeyBuffer;
    *private_data = privKeyBuffer;
    return 0;
}

int identity_key_store_get_local_registration_id(void *user_data, uint32_t *registration_id)
{
    std::cout << "GET LOCAL ID" << std::endl;
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    *registration_id = account->registrationId;
    return 0;
}

int identity_key_store_save_identity(const signal_protocol_address *address, uint8_t *key_data, size_t key_len, void *user_data)
{
    std::cout << "STORE IDENTITY KEY PAIR" << std::endl;
    CriptextDB::Account* account = (CriptextDB::Account*)user_data;
    string recipientId = std::string(address->name);
    int deviceId = address->device_id;

    char *identityKey = reinterpret_cast<char *>(key_data);
    std::cout << identityKey << std::endl;
    CriptextDB::createIdentityKey("../../electron_app/Criptext.db", recipientId, deviceId, identityKey);
    return 1;
}

int identity_key_store_is_trusted_identity(const signal_protocol_address *address, uint8_t *key_data, size_t key_len, void *user_data)
{
    std::cout << "IS TRUSTED" << std::endl;
    return 1;
}

void identity_key_store_destroy(void *user_data)
{
}

void setup_identity_key_store(signal_protocol_store_context *context, signal_context *global_context, CriptextDB::Account *account)
{
    signal_protocol_identity_key_store store = {
            .get_identity_key_pair = identity_key_store_get_identity_key_pair,
            .get_local_registration_id = identity_key_store_get_local_registration_id,
            .save_identity = identity_key_store_save_identity,
            .is_trusted_identity = identity_key_store_is_trusted_identity,
            .destroy_func = identity_key_store_destroy,
            .user_data = account
    };
    signal_protocol_store_context_set_identity_key_store(context, &store);
}