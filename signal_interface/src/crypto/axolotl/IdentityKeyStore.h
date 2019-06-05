#include "signal/signal_protocol.h"
#include "CriptextDB"
#include "base64.h"

void setup_identity_key_store(signal_protocol_store_context *context, signal_context *global_context, CriptextDB::Account *account)