#include "signal/signal_protocol.h"
#include "../../../../db_interface/src/axolotl/IdentityKey.h"
#include "../../../../db_interface/src/axolotl/Account.h"

void setup_identity_key_store(signal_protocol_store_context *context, signal_context *global_context, CriptextDB::Account *account);