#include "IdentityKeyStore.h"
#include "../store.h"
#include "../uthash.h"
#include <string>
#include <vector>
#include <iostream>

int identity_key_store_get_identity_key_pair(signal_buffer **public_data, signal_buffer **private_data, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    size_t len = 0;

    const unsigned char *identityKeyPriv = reinterpret_cast<const unsigned char *>(account->privKey.c_str());
    uint8_t *myPrivRecord = reinterpret_cast<uint8_t *>(base64_decode(identityKeyPriv, account->privKey.length(), &len));    
    signal_buffer *privKeyBuffer = signal_buffer_create(myPrivRecord, len);
    
    const unsigned char *identityKeyPub = reinterpret_cast<const unsigned char *>(account->pubKey.c_str());
    uint8_t *myPubRecord = reinterpret_cast<uint8_t *>(base64_decode(identityKeyPub, account->pubKey.length(), &len));    
    signal_buffer *pubKeyBuffer = signal_buffer_create(myPubRecord, len);
    
    *public_data = pubKeyBuffer;
    *private_data = privKeyBuffer;
    return 0;
}

int identity_key_store_get_local_registration_id(void *user_data, uint32_t *registration_id)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    *registration_id = account->registrationId;
    return 0;
}

int identity_key_store_save_identity(const signal_protocol_address *address, uint8_t *key_data, size_t key_len, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    string dbPath(account->dbPath);
    string recipientId = std::string(address->name);
    int deviceId = address->device_id;

    size_t data_len = 0;
    const unsigned char *myData = reinterpret_cast<const unsigned char *>(key_data);
    char *dataBase64 = reinterpret_cast<char *>(base64_encode(myData, key_len, &data_len));

    CriptextDB::createIdentityKey(dbPath, recipientId, deviceId, dataBase64);
    return 1;
}

int identity_key_store_is_trusted_identity(const signal_protocol_address *address, uint8_t *key_data, size_t key_len, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    string dbPath(account->dbPath);
    string recipientId = std::string(address->name);
    int deviceId = address->device_id;

    size_t data_len = 0;
    const unsigned char *identityKey = reinterpret_cast<const unsigned char *>(key_data);
    char *incomingIdentity = reinterpret_cast<char *>(base64_encode(identityKey, key_len, &data_len));    
    string incomingIdentityKey = string(incomingIdentity);

    try {
        CriptextDB::IdentityKey myIdentityKey = CriptextDB::getIdentityKey(dbPath, recipientId, deviceId);
        return myIdentityKey.identityKey == incomingIdentityKey;
    } catch (exception& e){
        std::cout << "Error trusting key : " << e.what() << std::endl;
        return 1;
    }
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