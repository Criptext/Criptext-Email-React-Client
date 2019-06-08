#include <check.h>
#include "./uthash.h"
#include <string>
#include <vector>
#include <axolotl/IdentityKeyStore>
#include <axolotl/PreKeyStore>
#include <axolotl/SessionStore>
#include <axolotl/SignedPreKeyStore>

void setup_store_context(signal_protocol_store_context **context, signal_context *global_context, int accountId)
{
    int result = 0;

    Account *account = CriptextDB::getAccount(accountId);

    signal_protocol_store_context *store_context = 0;
    result = signal_protocol_store_context_create(&store_context, global_context);

    setup_session_store(store_context, account);
    setup_pre_key_store(store_context, account);
    setup_signed_pre_key_store(store_context, account);
    setup_identity_key_store(store_context, global_context, account);

    *context = store_context;
}

