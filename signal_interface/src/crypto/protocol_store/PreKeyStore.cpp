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

    size_t privDecodeLen = 0;
    const uint8_t *privKeyData = 0;
    size_t pubDecodeLen = 0;
    const uint8_t *pubKeyData = 0;
    
    getKeyPairData(&pubKeyData, &privKeyData, &pubDecodeLen, &privDecodeLen, preKey.pubKey, preKey.privKey);

    ec_public_key *publicKey = 0;
    curve_decode_point(&publicKey, pubKeyData, pubDecodeLen, 0);

    ec_private_key *privateKey = 0;
    curve_decode_private_point(&privateKey, privKeyData, privDecodeLen, 0);
    
    ec_key_pair *keypair = 0;
    ec_key_pair_create(&keypair, publicKey, privateKey);

    session_pre_key *preKeyRecord = 0;
    session_pre_key_create(&preKeyRecord, pre_key_id, keypair);

    int result = 0;
    signal_buffer *buffer = 0;
    result = session_pre_key_serialize(&buffer, preKeyRecord);
    
    if(result < 0) {
        return SG_ERR_NOMEM;
    }
    *record = buffer;

    std::cout << "WELP 5" << std::endl;
    return 1;
}

int pre_key_store_store_pre_key(uint32_t pre_key_id, uint8_t *record, size_t record_len, void *user_data)
{
    std::cout << "STORE PREKEY" << std::endl;
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
    std::cout << "REMOVE PREKEY" << std::endl;
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