#include "helpers.h"

int SendJSON(struct mg_connection *conn, cJSON *json_obj) {
	char *json_str = cJSON_PrintUnformatted(json_obj);
	size_t json_str_len = strlen(json_str);

	mg_send_http_ok(conn, "application/json; charset=utf-8", json_str_len);
	mg_write(conn, json_str, json_str_len);

	cJSON_free(json_str);
	return (int)json_str_len;
}