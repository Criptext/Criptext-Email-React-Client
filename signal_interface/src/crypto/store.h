#include <signal/signal_protocol.h>
#include "protocol_store/IdentityKeyStore.h"
#include "protocol_store/PreKeyStore.h"
#include "protocol_store/SessionStore.h"
#include "protocol_store/SignedPreKeyStore.h"
#include <string>

void setup_store_context(signal_protocol_store_context **context, signal_context *global_context, CriptextDB::Account *account);
