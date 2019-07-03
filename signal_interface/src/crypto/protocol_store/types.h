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

struct session_pre_key {
    signal_type_base base;
    uint32_t id;
    ec_key_pair *key_pair;
};

struct session_record_state_node
{
    session_state *state;
    struct session_record_state_node *prev, *next;
};

struct session_record
{
    signal_type_base base;
    session_state *state;
    session_record_state_node *previous_states_head;
    int is_fresh;
    signal_buffer *user_record;
    signal_context *global_context;
};

typedef struct message_keys_node
{
    ratchet_message_keys message_key;
    struct message_keys_node *prev, *next;
} message_keys_node;

typedef struct session_state_sender_chain
{
    ec_key_pair *sender_ratchet_key_pair;
    ratchet_chain_key *chain_key;
} session_state_sender_chain;

typedef struct session_state_receiver_chain
{
    ec_public_key *sender_ratchet_key;
    ratchet_chain_key *chain_key;
    message_keys_node *message_keys_head;
    struct session_state_receiver_chain *prev, *next;
} session_state_receiver_chain;

typedef struct session_pending_key_exchange
{
    uint32_t sequence;
    ec_key_pair *local_base_key;
    ec_key_pair *local_ratchet_key;
    ratchet_identity_key_pair *local_identity_key;
} session_pending_key_exchange;

typedef struct session_pending_pre_key {
    int has_pre_key_id;
    uint32_t pre_key_id;
    uint32_t signed_pre_key_id;
    ec_public_key *base_key;
} session_pending_pre_key;

struct session_state {
    signal_type_base base;

    uint32_t session_version;
    ec_public_key *local_identity_public;
    ec_public_key *remote_identity_public;

    ratchet_root_key *root_key;
    uint32_t previous_counter;

    int has_sender_chain;
    session_state_sender_chain sender_chain;

    session_state_receiver_chain *receiver_chain_head;

    int has_pending_key_exchange;
    session_pending_key_exchange pending_key_exchange;

    int has_pending_pre_key;
    session_pending_pre_key pending_pre_key;

    uint32_t remote_registration_id;
    uint32_t local_registration_id;

    int needs_refresh;
    ec_public_key *alice_base_key;

    signal_context *global_context;
};

struct ratchet_chain_key {
    signal_type_base base;
    signal_context *global_context;
    hkdf_context *kdf;
    uint8_t *key;
    size_t key_len;
    uint32_t index;
};

struct ratchet_root_key {
    signal_type_base base;
    signal_context *global_context;
    hkdf_context *kdf;
    uint8_t *key;
    size_t key_len;
};

struct ratchet_identity_key_pair {
    signal_type_base base;
    ec_public_key *public_key;
    ec_private_key *private_key;
};

struct ec_key_pair
{
    signal_type_base base;
    ec_public_key *public_key;
    ec_private_key *private_key;
};

#define DJB_KEY_LEN 32

struct ec_public_key
{
    signal_type_base base;
    uint8_t data[DJB_KEY_LEN];
};

struct ec_private_key
{
    signal_type_base base;
    uint8_t data[DJB_KEY_LEN];
};

#endif