#ifndef DECODE_UTILS_H
#define DECODE_UTILS_H

#include <string>
#include <string.h>
#include <signal/signal_protocol.h>
#include <signal/protocol.h>

extern "C" {
    #include "../base64.h"
}

int getKeyPairData(const uint8_t **publicKey, const uint8_t **privateKey, size_t *publicLen, size_t *privateLen, std::string pubKey, std::string privKey);

#endif