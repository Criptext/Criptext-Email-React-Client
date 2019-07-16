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
        preKey = CriptextDB::getPreKey("../../electron_app/Criptext.db", pre_key_id);
    } catch (exception& e){
        return 0;
    }

    size_t len = 0;
    unsigned char *recordBase64 = reinterpret_cast<unsigned char *>(preKey.record);
    uint8_t *myRecord = reinterpret_cast<uint8_t *>(base64_decode(recordBase64, preKey.len, &len));    
    signal_buffer *buffer = signal_buffer_create(myRecord, len);
    *record = buffer;

    return 1;
}

int pre_key_store_store_pre_key(uint32_t pre_key_id, uint8_t *record, size_t record_len, void *user_data)
{
    size_t len = 0;
    const unsigned char *myRecord = reinterpret_cast<const unsigned char *>(record);
    char *recordBase64 = reinterpret_cast<char *>(base64_encode(myRecord, record_len, &len));

    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    bool success = CriptextDB::createPreKey("../../electron_app/Criptext.db", pre_key_id, recordBase64, len);
    return success ? 1 : 0;
}

int pre_key_store_contains_pre_key(uint32_t pre_key_id, void *user_data)
{
    std::cout << "CONTAINS PREKEY : " << pre_key_id << std::endl; 
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    CriptextDB::PreKey preKey;

    try {
        preKey = CriptextDB::getPreKey("../../electron_app/Criptext.db", pre_key_id);
    } catch (exception& e){
        return 0;
    }
    
    return 1;
}

int pre_key_store_remove_pre_key(uint32_t pre_key_id, void *user_data) {
    std::cout << "REMOVE PREKEY" << std::endl;
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    bool success = CriptextDB::deletePreKey("../../electron_app/Criptext.db", pre_key_id);
    return success ? 1 : 0;
}

void pre_key_store_destroy(void *user_data) {
    
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