#include "SignedPreKeyStore.h"
#include "../store.h"
#include "../uthash.h"
#include <string>
#include <vector>
#include <iostream>

int signed_pre_key_store_load_signed_pre_key(signal_buffer **record, uint32_t signed_pre_key_id, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    CriptextDB::SignedPreKey signedPreKey;

    try {
        signedPreKey = CriptextDB::getSignedPreKey("Criptext.db", signed_pre_key_id, account->id);
    } catch (exception& e){
        return 0;
    }
    
    const uint8_t* recordData = reinterpret_cast<const uint8_t*>(signedPreKey.privKey.c_str());
    signal_buffer *result = signal_buffer_create(recordData, strlen(signedPreKey.privKey.c_str()));
    
    if(!result) {
        return SG_ERR_NOMEM;
    }
    *record = result;

    std::cout << "WELP" << std::endl;
    return 1;
}

int signed_pre_key_store_store_signed_pre_key(uint32_t signed_pre_key_id, uint8_t *record, size_t record_len, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    bool success = CriptextDB::createSignedPreKey("Criptext.db", signed_pre_key_id, "<PrivKey>", "<PubKey>", account->id);
    return success ? 1 : 0;
}

int signed_pre_key_store_contains_signed_pre_key(uint32_t signed_pre_key_id, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    try {
        CriptextDB::getSignedPreKey("Criptext.db", signed_pre_key_id, account->id);
    } catch (exception& e){
        return 0;
    }
    return 1;
}

int signed_pre_key_store_remove_signed_pre_key(uint32_t signed_pre_key_id, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    bool success = CriptextDB::deleteSignedPreKey("Criptext.db", signed_pre_key_id, account->id);
    return success ? 1 : 0;
}

void signed_pre_key_store_destroy(void *user_data)
{
    
}

void setup_signed_pre_key_store(signal_protocol_store_context *context, CriptextDB::Account *account)
{
    signal_protocol_signed_pre_key_store store = {
            .load_signed_pre_key = signed_pre_key_store_load_signed_pre_key,
            .store_signed_pre_key = signed_pre_key_store_store_signed_pre_key,
            .contains_signed_pre_key = signed_pre_key_store_contains_signed_pre_key,
            .remove_signed_pre_key = signed_pre_key_store_remove_signed_pre_key,
            .destroy_func = signed_pre_key_store_destroy,
            .user_data = account
    };

    signal_protocol_store_context_set_signed_pre_key_store(context, &store);
}