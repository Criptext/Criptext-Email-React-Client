#ifndef SIGNAL_H
#define SIGNAL_H

#include "../types.h"

#include <signal/signal_protocol.h>

void signal_shutdown();
signal_context* signal_init();
void signal_setup_session(struct keybundle* kb);
int signal_encrypt_bytes(const char* original, int original_len, char** bytes, signal_protocol_address* address, int* message_type);
int signal_get_known_addresses(int** addresses, char* recipient, char* domain);
void signal_delete_session(struct blacklisted* bl);

#endif