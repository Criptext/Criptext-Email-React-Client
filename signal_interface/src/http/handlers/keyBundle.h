#include <civetweb.h>
#include <cjson/cJSON.h>
#include "cors.h"
#include <string>
#include <iostream>
#include <signal/session_pre_key.h>
#include "../../crypto/signal.h"
#include "helpers.h"

int createKeyBundle(struct mg_connection *conn, void *cbdata);
int processKeyBundle(struct mg_connection *conn, void *cbdata);
int createAccount(struct mg_connection *conn, void *cbdata);