#include "signal/signal_protocol.h"
#include "../../../../db_interface/src/axolotl/PreKey.h"
#include "../../../../db_interface/src/axolotl/Account.h"
#include "decode_utils.h"

void setup_pre_key_store(signal_protocol_store_context *context, CriptextDB::Account *account);