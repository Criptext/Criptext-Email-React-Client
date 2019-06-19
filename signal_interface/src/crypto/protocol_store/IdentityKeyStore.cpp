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

    size_t pubDecodeLen = 0;
    const uint8_t *pubKeyData = 0;
    size_t privDecodeLen = 0;
    const uint8_t *privKeyData = 0;
    
    getKeyPairData(&pubKeyData, &privKeyData, &pubDecodeLen, &privDecodeLen, account->pubKey, account->privKey);

    signal_buffer *pubKeyBuffer = signal_buffer_create(pubKeyData, pubDecodeLen);
    signal_buffer *privKeyBuffer = signal_buffer_create(privKeyData, privDecodeLen);
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
    
    string identityKey = std::string(key_data, key_data + key_len);

    CriptextDB::createIdentityKey("Criptext.db", recipientId, deviceId, identityKey, account->id);
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