#ifndef SIGNAL_H
#define SIGNAL_H

#include <string>
#include <signal/session_builder.h>
#include <signal/session_cipher.h>
#include <signal/protocol.h>

#include "store.h"
extern "C" {
    #include "crypto.h"
    #include "base64.h"
}
/*static pthread_mutex_t global_mutex;

void lock_fn(void *user_data){
    pthread_mutex_lock(&global_mutex);
}

void unlock_fn(void *user_data){
    pthread_mutex_unlock(&global_mutex);
}
*/
struct signal_buffer {
    size_t len;
    uint8_t data[];
};

class CriptextSignal {

    CriptextDB::Account account;
    signal_context* global_context = 0;
    signal_protocol_store_context* encrypter_stote = 0;

    public :
        CriptextSignal(int accountId);
        std::string decryptText(std::string encryptedText, std::string recipientId, int deviceId, int message_type);
        void clean();
};

#endif