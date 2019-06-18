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

    size_t privDecodeLen = 0;
    const unsigned char *signedPrivKeyC = reinterpret_cast<const unsigned char*>(signedPreKey.privKey.c_str());
    unsigned char* privKeyFromB64 = base64_decode(signedPrivKeyC, strlen((char *)signedPrivKeyC), &privDecodeLen);
    const uint8_t *privKeyData = reinterpret_cast<const uint8_t*>(privKeyFromB64);
    
    size_t pubDecodeLen = 0;
    const unsigned char *signedPubKeyC = reinterpret_cast<const unsigned char*>(signedPreKey.pubKey.c_str());
    unsigned char* pubKeyFromB64 = base64_decode(signedPubKeyC, strlen((char *)signedPubKeyC), &pubDecodeLen);
    const uint8_t *pubKeyData = reinterpret_cast<const uint8_t*>(pubKeyFromB64);

    ec_public_key *publicKey = 0;
    curve_decode_point(&publicKey, pubKeyData, pubDecodeLen, 0);

    ec_private_key *privateKey = 0;
    curve_decode_private_point(&privateKey, privKeyData, privDecodeLen, 0);
    
    ec_key_pair *keypair = 0;
    ec_key_pair_create(&keypair, publicKey, privateKey);

    session_signed_pre_key *signedPreKeyRecord = 0;
    const uint8_t dummySignature = {0xFA};
    session_signed_pre_key_create(&signedPreKeyRecord, signed_pre_key_id, 1000000, keypair, &dummySignature, sizeof(dummySignature));

    int result = 0;
    signal_buffer *buffer = 0;
    result = session_signed_pre_key_serialize(&buffer, signedPreKeyRecord);
    
    if(result < 0) {
        return SG_ERR_NOMEM;
    }
    *record = buffer;

    std::cout << "WELP 4" << std::endl;
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