#include "signal.h"

#include <stdio.h>
#include <string.h>
#include <pthread.h>
#include <curl/curl.h>
#include <signal/session_builder.h>
#include <signal/session_cipher.h>
#include <signal/protocol.h>
// #include <signal/signal_protocol_types.h>

#include "./crypto.h"
#include "./store.h"
#include "./base64.h"

#define KEY_LEN 32

pthread_mutex_t global_mutex;
signal_context* global_context;

signal_protocol_store_context* encrypter_stote = 0;

struct signal_type_base {
    unsigned int ref_count;
    void (*destroy)(signal_type_base *instance);
};

void signal_type_init(signal_type_base *instance,
        void (*destroy_func)(signal_type_base *instance));

#define SIGNAL_INIT(instance, destroy_func) signal_type_init((signal_type_base *)instance, destroy_func)

struct signal_buffer {
    size_t len;
    uint8_t data[];
};

struct ec_public_key
{
    signal_type_base base;
    uint8_t data[KEY_LEN];
};


void lock_fn(void *user_data){
    pthread_mutex_lock(&global_mutex);
}

void unlock_fn(void *user_data){
    pthread_mutex_unlock(&global_mutex);
}

void signal_shutdown(){
    signal_context_destroy(global_context);
    signal_protocol_store_context_destroy(encrypter_stote);

}

signal_context* signal_init(){
    int result = 0;

    // printf("%d\n",1);
    result = signal_context_create(&global_context, 0);
    // printf("signal_context_create %d\n",result);

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

    setup_store_context(&encrypter_stote, global_context);

    return global_context;
}

void signal_setup_session(struct keybundle* kb){
    size_t decode_len = 0;

    char* decoded_prekey_public = 0;
    ec_public_key* pre_key_public = 0;
    
    //if i have public prekey, decodeq
    if(kb->prekey_id){
        pre_key_public = malloc(sizeof(ec_public_key));
        SIGNAL_INIT(pre_key_public, ec_public_key_destroy);
        char* decoded_prekey_public = base64_decode(kb->prekey_public, strlen(kb->prekey_public), &decode_len);
        memcpy(pre_key_public->data, decoded_prekey_public + 1, KEY_LEN);
        free(decoded_prekey_public);
    }

    ec_public_key* signed_pre_key_public = malloc(sizeof(ec_public_key));
    SIGNAL_INIT(signed_pre_key_public, ec_public_key_destroy);
    char* decoded_signed_prekey_public = base64_decode(kb->signed_prekey_public, 44, &decode_len);
    memcpy(signed_pre_key_public->data, decoded_signed_prekey_public + 1, KEY_LEN);
    free(decoded_signed_prekey_public);

    ec_public_key* identity_key_public = malloc(sizeof(ec_public_key));
    SIGNAL_INIT(identity_key_public, ec_public_key_destroy);
    char* decoded_identity_public_key = base64_decode(kb->identity_public_key, 44, &decode_len);
    memcpy(identity_key_public->data, decoded_identity_public_key + 1, KEY_LEN);
    free(decoded_identity_public_key);

    int8_t* decoded_signed_prekey_signature = (int8_t*)base64_decode(kb->signed_prekey_signature, strlen(kb->signed_prekey_signature), &decode_len);
    

    /* Create a correct pre key bundle */
    session_pre_key_bundle* pre_key_bundle = 0;
    int result = session_pre_key_bundle_create(&pre_key_bundle,
        kb->registration_id,
        kb->device_id, /* device ID */
        kb->prekey_id, /* pre key ID */
        pre_key_public,
        kb->signed_prekey_id, /* signed pre key ID */
        signed_pre_key_public,
        decoded_signed_prekey_signature,
        64,
        identity_key_public);
    
    free(decoded_signed_prekey_signature);

    //create name
    char recipient_domain[strlen(kb->recipient_id) + strlen(kb->domain) + 2];
    strcpy(recipient_domain,"");
    strcat(recipient_domain, kb->recipient_id);
    strcat(recipient_domain, "@");
    strcat(recipient_domain, kb->domain);



    signal_protocol_address* address = malloc(sizeof(signal_protocol_address));
    address->device_id = kb->device_id;
    address->name = recipient_domain;
    address->name_len = strlen(recipient_domain);

    session_builder* session_builder = 0;
    result = session_builder_create(&session_builder, encrypter_stote, address, global_context);

    // /* Process the bundle and make sure we do not fail */
    result = session_builder_process_pre_key_bundle(session_builder, pre_key_bundle);

    SIGNAL_UNREF(pre_key_public);
    SIGNAL_UNREF(signed_pre_key_public);
    SIGNAL_UNREF(identity_key_public);
    SIGNAL_UNREF(pre_key_bundle);
    free(address);
    session_builder_free(session_builder);
}

void signal_delete_session(struct blacklisted* bl){

    char recipient_domain[strlen(bl->recipient_id) + strlen(bl->domain) + 2];
    strcpy(recipient_domain, "");
    strcat(recipient_domain, bl->recipient_id);
    strcat(recipient_domain, "@");
    strcat(recipient_domain, bl->domain);

    for (int i =0; i < bl->devices_len; i ++){
       int result;
       signal_protocol_address* address = malloc(sizeof(signal_protocol_address));
       address->name = recipient_domain;
       address->device_id = (bl->devices)[i];
       address->name_len = strlen(recipient_domain);
       result = signal_protocol_session_delete_session(encrypter_stote, address);
       free(address);
    }
}

int signal_encrypt_bytes(const char* original, int original_len, char** bytes, signal_protocol_address* address, int* message_type){

    int result;

    session_cipher *session_cipher = 0;
    result = session_cipher_create(&session_cipher, encrypter_stote, address, global_context);

    ciphertext_message *outgoing_message = 0;
    result = session_cipher_encrypt(session_cipher, (uint8_t *)original, original_len, &outgoing_message);

    struct signal_buffer *outgoing_serialized = ciphertext_message_get_serialized(outgoing_message);
    *bytes = malloc(signal_buffer_len(outgoing_serialized) + 1);
    memcpy(*bytes, signal_buffer_data(outgoing_serialized), signal_buffer_len(outgoing_serialized)), 

    *message_type = ciphertext_message_get_type(outgoing_message);
    
    int buffer_len = signal_buffer_len(outgoing_serialized); 

    session_cipher_free(session_cipher);
    SIGNAL_UNREF(outgoing_message);

    return buffer_len;
}

int signal_get_known_addresses(int** addresses, char* recipient, char* domain){ 

    char recipient_domain[strlen(recipient) + strlen(domain) + 2];
    strcpy(recipient_domain, "");
    strcat(recipient_domain, recipient);
    strcat(recipient_domain, "@");
    strcat(recipient_domain, domain);

    signal_int_list* list;
    signal_protocol_session_get_sub_device_sessions(encrypter_stote, &list, recipient_domain, strlen(recipient_domain));

    int count = signal_int_list_size(list);

    *addresses = malloc(sizeof(int) * count);

    for(int i = 0; i < count; ++i){
        (*addresses)[i] = signal_int_list_at(list, i);
    } 

    signal_int_list_free(list);
    return count; //will answer the devices of recipient@domain 
}