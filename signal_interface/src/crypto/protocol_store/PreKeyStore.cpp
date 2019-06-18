#include "PreKeyStore.h"
#include "../store.h"
#include "../uthash.h"
#include <string>
#include <vector>
#include <iostream>

int pre_key_store_load_pre_key(signal_buffer **record, uint32_t pre_key_id, void *user_data)
{

    std::cout << "LOAD PREKEY : " << pre_key_id << std::endl; 

    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    CriptextDB::PreKey preKey;

    try {
        preKey = CriptextDB::getPreKey("Criptext.db", pre_key_id, account->id);
    } catch (exception& e){
        return 0;
    }

    const uint8_t* recordData = reinterpret_cast<const uint8_t*>(preKey.privKey.c_str());
    signal_buffer *result = signal_buffer_create(recordData, sizeof(recordData));
    if(!result) {
        return SG_ERR_NOMEM;
    }
    *record = result;
    return 1;
}

int pre_key_store_store_pre_key(uint32_t pre_key_id, uint8_t *record, size_t record_len, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    bool success = CriptextDB::createPreKey("Criptext.db", pre_key_id, "<PrivKey>", "<PubKey>", account->id);
    return success ? 1 : 0;
}

int pre_key_store_contains_pre_key(uint32_t pre_key_id, void *user_data)
{
    std::cout << "CONTAINS PREKEY : " << pre_key_id << std::endl; 
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    CriptextDB::PreKey preKey;

    try {
        preKey = CriptextDB::getPreKey("Criptext.db", pre_key_id, account->id);
    } catch (exception& e){
        return 0;
    }
    
    return 1;
}

int pre_key_store_remove_pre_key(uint32_t pre_key_id, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    bool success = CriptextDB::deletePreKey("Criptext.db", pre_key_id, account->id);
    return success ? 1 : 0;
}

void pre_key_store_destroy(void *user_data)
{
    
}

void setup_pre_key_store(signal_protocol_store_context *context, CriptextDB::Account *account)
{
    signal_protocol_pre_key_store store = {
        .load_pre_key = pre_key_store_load_pre_key,
        .store_pre_key = pre_key_store_store_pre_key,
        .contains_pre_key = pre_key_store_contains_pre_key,
        .remove_pre_key = pre_key_store_remove_pre_key,
        .destroy_func = pre_key_store_destroy,
        .user_data = account
    };

    signal_protocol_store_context_set_pre_key_store(context, &store);
}