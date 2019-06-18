#include "signal/signal_protocol.h"
#include "signal/curve.h"
#include "../../../../db_interface/src/axolotl/SignedPreKey.h"
#include "../../../../db_interface/src/axolotl/Account.h"
#include "types.h"

extern "C" {
    #include "../base64.h"
}

void setup_signed_pre_key_store(signal_protocol_store_context *context, CriptextDB::Account *account);