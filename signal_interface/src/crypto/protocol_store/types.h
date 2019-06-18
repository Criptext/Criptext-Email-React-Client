#ifndef C_TYPES_H
#define C_TYPES_H

#include <signal/signal_protocol.h>
#include <signal/session_builder.h>
#include <signal/session_cipher.h>
#include <signal/protocol.h>

struct signal_type_base {
    unsigned int ref_count;
    void (*destroy)(signal_type_base *instance);
};

void signal_type_init(signal_type_base *instance,
        void (*destroy_func)(signal_type_base *instance));

#define SIGNAL_INIT(instance, destroy_func) signal_type_init((signal_type_base *)instance, destroy_func)

struct session_signed_pre_key {
    signal_type_base base;
    uint32_t id;
    ec_key_pair *key_pair;
    uint64_t timestamp;
    size_t signature_len;
    uint8_t signature[];
};

struct signal_buffer {
    size_t len;
    uint8_t data[];
};

#endif