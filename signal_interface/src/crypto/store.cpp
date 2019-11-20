#include "store.h"
#include <string>
#include <vector>
#include <iostream>

void setup_store_context(signal_protocol_store_context **context, signal_context *global_context, CriptextDB::Account *account)
{
    signal_protocol_store_context *store_context = 0;
    signal_protocol_store_context_create(&store_context, global_context);

    setup_session_store(store_context, account);
    setup_pre_key_store(store_context, account);
    setup_signed_pre_key_store(store_context, account);
    setup_identity_key_store(store_context, global_context, account);

    *context = store_context;
}

