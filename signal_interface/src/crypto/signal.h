#ifndef SIGNAL_H
#define SIGNAL_H

#include <string>
#include <signal/session_builder.h>
#include <signal/session_cipher.h>
#include <signal/protocol.h>
#include "./protocol_store/types.h"

#include "store.h"
extern "C" {
    #include "crypto.h"
    #include "base64.h"
}

class CriptextSignal {

    CriptextDB::Account account;
    signal_context* global_context = 0;
    signal_protocol_store_context* encrypter_stote = 0;

    public :
        CriptextSignal(int accountId);
        int decryptText(uint8_t **plaintext_data, size_t *plaintext_len, std::string encryptedText, std::string recipientId, int deviceId, int message_type);
        void clean();
};

#endif