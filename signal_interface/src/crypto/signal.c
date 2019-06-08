#include "signal.h"
#include <string.h>
#include <signal/session_builder.h>
#include <signal/session_cipher.h>
#include <signal/protocol.h>

#include "./crypto.h"
#include "./store.h"
#include "./base64.h"

struct signal_buffer {
    size_t len;
    uint8_t data[];
};

class CriptextSignal {

    void lock_fn(void *user_data){
        pthread_mutex_lock(&global_mutex);
    }

    void unlock_fn(void *user_data){
        pthread_mutex_unlock(&global_mutex);
    }

    pthread_mutex_t global_mutex;
    signal_context* global_context;

    signal_protocol_store_context* encrypter_stote = 0;

    void clean() {
        signal_context_destroy(global_context);
        signal_protocol_store_context_destroy(encrypter_stote);
    }

    int decryptMessage(struct encrypted_entity** out,
        struct username* usernames,
        size_t usernames_n,
        char** file_keys,
        size_t file_key_count,
        char* body,
        int body_len,
        char* headers,
        int headers_len,
        char* preview,
        int preview_len) {
        
    }

    CriptextSignal(string accountId) {
        int result = 0;

        result = signal_context_create(&global_context, 0);

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
            .encrypt_func = encrypt,
            .decrypt_func = decrypt,
            .user_data = 0
        };

        result = signal_context_set_crypto_provider(global_context, &provider);
        // printf("signal_context_set_crypto_provider %d\n",result);
        result = signal_context_set_locking_functions(global_context, lock_fn, unlock_fn);
        // printf("signal_context_set_locking_functions %d\n",result);

        setup_store_context(&encrypter_stote, global_context, accountId);
    }

    string signal_decrypt_text(string encryptedText, string recipientId, int deviceId, int message_type){

        int result;

        signal_protocol_address address = {
            .name = recipientId,
            .name_len = strlen(recipientId),
            .device_id = deviceId
        };

        session_cipher *session_cipher = 0;
        result = session_cipher_create(&session_cipher, encrypter_stote, address, global_context);
        
        if (message_type == 1) {
            uint8_t *messageData = reinterpret_cast<const uint8_t*>(encryptedText);
            signal_message *incoming_message = 0;
            signal_message_deserialize(&incoming_message, messageData, sizeof(messageData), global_context);
            signal_buffer *plainMessage = 0;
            session_cipher_decrypt_signal_message(&session_cipher, incoming_message, 0, &plainMessage)
            return string recipientId = str(plainMessage->data, plainMessage->len);
        } else {
            uint8_t *preKeyMessageData = reinterpret_cast<const uint8_t*>(encryptedText);
            signal_message *incoming_message = 0;
            signal_message_deserialize(&incoming_message, messageData, sizeof(messageData), global_context);
            signal_buffer *plainMessage = 0;
            session_cipher_decrypt_pre_key_signal_message(&session_cipher, incoming_message, 0, &plainMessage)
            return string recipientId = str(plainMessage->data, plainMessage->len);
        }
    }
}