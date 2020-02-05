#include <stdlib.h>
#include <string>
#include <civetweb.h>
#include "../../../db_interface/src/axolotl/Account.h"
#include "./handlers/decrypt.h"
#include "./handlers/encrypt.h"
#include "./handlers/keyBundle.h"
#include "./handlers/password.h"

void http_init(char *dbPath, char *port, char *token);
void http_shutdown();