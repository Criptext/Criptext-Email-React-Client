#include "decode_utils.h"

int getKeyPairData(const uint8_t **publicKey, const uint8_t **privateKey, size_t *publicLen, size_t *privateLen, std::string pubKey, std::string privKey) {
    size_t pubDecodeLen = 0;
    const unsigned char *signedPubKeyC = reinterpret_cast<const unsigned char*>(pubKey.c_str());
    unsigned char* pubKeyFromB64 = base64_decode(signedPubKeyC, strlen((char *)signedPubKeyC), &pubDecodeLen);
    const uint8_t *pubKeyData = reinterpret_cast<const uint8_t*>(pubKeyFromB64);
    *publicKey = pubKeyData;
    *publicLen = pubDecodeLen;

    size_t privDecodeLen = 0;
    const unsigned char *signedPrivKeyC = reinterpret_cast<const unsigned char*>(privKey.c_str());
    unsigned char* privKeyFromB64 = base64_decode(signedPrivKeyC, strlen((char *)signedPrivKeyC), &privDecodeLen);
    const uint8_t *privKeyData = reinterpret_cast<const uint8_t*>(privKeyFromB64);
    *privateKey = privKeyData;
    *privateLen = privDecodeLen;
}