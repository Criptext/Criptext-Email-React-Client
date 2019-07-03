#include <sstream>
#include <codecvt>
#include "signal/signal_protocol.h"
#include "../../../../db_interface/src/axolotl/SessionRecord.h"
#include "../../../../db_interface/src/axolotl/Account.h"
extern "C" {
  #include "../../helpers/utf8.h"
}

void setup_session_store(signal_protocol_store_context *context, CriptextDB::Account *account);
