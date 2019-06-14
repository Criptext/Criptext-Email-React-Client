#include "signal.h"
#include <string>
#include <iostream>

CriptextSignal::CriptextSignal(int accountId){
    signal_context_create(&global_context, 0);
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
        .encrypt_func = encrypth,
        .decrypt_func = decrypt,
        .user_data = 0
    };

    signal_context_set_crypto_provider(global_context, &provider);
    try {
        account = CriptextDB::getAccount("Criptext.db", accountId);
    } catch (exception &e) {
        return;
    }
    setup_store_context(&encrypter_stote, global_context, &account);
}

std::string CriptextSignal::decryptText(std::string encryptedText, std::string recipientId, int deviceId, int message_type){

    int result;

    signal_protocol_address address = {
        .name = recipientId.c_str(),
        .name_len = recipientId.length(),
        .device_id = deviceId
    };

    session_cipher *session_cipher = 0;
    result = session_cipher_create(&session_cipher, encrypter_stote, &address, global_context);
    std::cout << result << std::endl;
    size_t decode_len = 0;
    const unsigned char *encryptedCText = reinterpret_cast<const unsigned char*>(encryptedText.c_str());
    unsigned char* textFromB64 = base64_decode(encryptedCText, strlen((char *)encryptedCText), &decode_len);

    try {
        if (message_type == 1) {
            const uint8_t *messageData = reinterpret_cast<const uint8_t*>(textFromB64);
            signal_message *incoming_message = 0;
            signal_message_deserialize(&incoming_message, messageData, sizeof(messageData), global_context);
            signal_buffer *plainMessage = 0;
            session_cipher_decrypt_signal_message(session_cipher, incoming_message, 0, &plainMessage);
            return std::string(*plainMessage->data, *plainMessage->data + plainMessage->len);
        } else {
            const uint8_t *preKeyMessageData = reinterpret_cast<const uint8_t*>(textFromB64);
            pre_key_signal_message *incoming_message = 0;
            pre_key_signal_message_deserialize(&incoming_message, preKeyMessageData, decode_len, global_context);
            signal_buffer *plainMessage = 0;
            session_cipher_decrypt_pre_key_signal_message(session_cipher, incoming_message, 0, &plainMessage);
            return std::string(*plainMessage->data, *plainMessage->data + plainMessage->len);
        }
    } catch(exception &ex) {
        return "Content Unencrypted";
    }
}

void CriptextSignal::clean() {
    signal_context_destroy(global_context);
    signal_protocol_store_context_destroy(encrypter_stote);
}