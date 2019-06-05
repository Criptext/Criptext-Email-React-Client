#include <check.h>
#include "./store.h"
#include "./uthash.h"
#include <string>
#include <vector>

int signed_pre_key_store_load_signed_pre_key(signal_buffer **record, uint32_t signed_pre_key_id, void *user_data)
{
    CriptextDB::Account *account = user_data;
    CriptextDB::SignedPreKey signedPreKey = CriptextDB::getSignedPreKey("<dbPath>", signed_pre_key_id, account->id);

    if(!preKeyRecord) {
        return 0;
    }
    uint8_t* recordData = reinterpret_cast<const uint8_t*>(signedPreKey.privKey.getString());
    signal_buffer *result = signal_buffer_create(recordData, sizeof(recordData));
    if(!result) {
        return SG_ERR_NOMEM;
    }
    *record = result;
    return 1;
}

int signed_pre_key_store_store_signed_pre_key(uint32_t signed_pre_key_id, uint8_t *record, size_t record_len, void *user_data)
{
    CriptextDB::Account *account = user_data;
    bool success = CriptextDB::createSignedPreKey("<dbPath>", signed_pre_key_id, "<PrivKey>", "<PubKey>", account->id);
    return success ? 1 : 0;
}

int signed_pre_key_store_contains_signed_pre_key(uint32_t signed_pre_key_id, void *user_data)
{
    CriptextDB::Account *account = user_data;
    CriptextDB::PreKey preKey = CriptextDB::getSignedPreKey("<dbPath>", signed_pre_key_id, account->id);
    return !preKey ? 0 : 1;
}

int signed_pre_key_store_remove_signed_pre_key(uint32_t signed_pre_key_id, void *user_data)
{
    CriptextDB::Account *account = user_data;
    bool success = CriptextDB::deleteSignedPreKey("<dbPath>", signed_pre_key_id, account->id);
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