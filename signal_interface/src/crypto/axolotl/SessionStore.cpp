#include <check.h>
#include "./store.h"
#include "./uthash.h"
#include <string>
#include <vector>

int session_store_load_session(signal_buffer **record, signal_buffer **user_record, const signal_protocol_address *address, void *user_data)
{
    CriptextDB::Account *account = user_data;
    string recipientId = str(address->name);
    int deviceId = address->device_id;
    CriptextDB::SessionRecord sessionRecord = CriptextDB::getSessionRecord("<path>", account->id, recipientId, deviceId);

    if(!sessionRecord) {
        return 0;
    }
    uint8_t* recordData = reinterpret_cast<const uint8_t*>(sessionRecord.record.c_str());
    signal_buffer *result = signal_buffer_create(recordData, sizeof(recordData));
    if(!result) {
        return SG_ERR_NOMEM;
    }
    *record = result;
    return 1;
}

int session_store_get_sub_device_sessions(signal_int_list **sessions, const char *name, size_t name_len, void *user_data)
{
    signal_int_list *result = signal_int_list_alloc();
    if(!result) {
        return SG_ERR_NOMEM;
    }

    CriptextDB::Account *account = user_data;
    string recipientId = str(name, name_len);
    CriptextDB::SessionRecord sessionRecords = CriptextDB::getSessionRecords("<path>", account->id, recipientId);

    for (auto sessionRecord : sessionRecords) {
      signal_int_list_push_back(result, sessionRecord.deviceId)
    }

    *sessions = result;
    return 0;
}

int session_store_store_session(const signal_protocol_address *address, uint8_t *record, size_t record_len, uint8_t *user_record_data, size_t user_record_len, void *user_data)
{
    CriptextDB::Account *account = user_data;
    string recipientId = str(address->name);
    int deviceId = address->device_id;
    string record(user_record_data, user_record_len);
    bool success = CriptextDB::createSessionRecord("<path>", account->id, recipientId, deviceId, record)

    return bool ? 1 : 0;
}

int session_store_contains_session(const signal_protocol_address *address, void *user_data)
{
    string recipientId = str(address->name);
    int deviceId = address->device_id;
    CriptextDB::SessionRecord sessionRecord = CriptextDB::getSessionRecord("", account->id, recipientId, deviceId);

    return (!sessionRecord) ? 0 : 1;
}

int session_store_delete_session(const signal_protocol_address *address, void *user_data)
{
    string recipientId = str(address->name);
    int deviceId = address->device_id;
    bool success = CriptextDB::deleteSessionRecord("<path>", account->id, recipientId, deviceId);

    return success ? 1 : 0;
}

int session_store_delete_all_sessions(const char *name, size_t name_len, void *user_data)
{
    string recipientId = str(name, name_len);
    bool success = CriptextDB::deleteSessionRecords("<path>", account->id, recipientId);

    return success ? 1 : 0;
}

void session_store_destroy(void *user_data)
{
    
}

void setup_session_store(signal_protocol_store_context *context, CriptextDB::Account *account)
{
    signal_protocol_session_store store = {
        .load_session_func = session_store_load_session,
        .get_sub_device_sessions_func = session_store_get_sub_device_sessions,
        .store_session_func = session_store_store_session,
        .contains_session_func = session_store_contains_session,
        .delete_session_func = session_store_delete_session,
        .delete_all_sessions_func = session_store_delete_all_sessions,
        .destroy_func = session_store_destroy,
        .user_data = account
    };

    signal_protocol_store_context_set_session_store(context, &store);
}