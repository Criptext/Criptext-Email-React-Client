#include <stdlib.h>
#include <string.h>
#include <civetweb.h>

struct mg_callbacks callbacks;
struct mg_context *ctx;

void http_init();
void http_shutdown();