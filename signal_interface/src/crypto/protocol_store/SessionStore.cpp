#include "SessionStore.h"
#include "../store.h"
#include "../uthash.h"
#include <inttypes.h>
#include <string>
#include <vector>
#include <iostream>

int session_store_load_session(signal_buffer **record, signal_buffer **user_record, const signal_protocol_address *address, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    string dbPath(account->dbPath);

    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;
    CriptextDB::SessionRecord sessionRecord;
    try {
        sessionRecord = CriptextDB::getSessionRecord(dbPath, recipientId, deviceId);
    } catch (exception& e) {
        std::cout << "ERRORs : " << e.what() << std::endl;
        return 0;
    }
    size_t len = 0;
    unsigned char *recordBase64 = reinterpret_cast<unsigned char *>(sessionRecord.record);
    uint8_t *myRecord = reinterpret_cast<uint8_t *>(base64_decode(recordBase64, sessionRecord.len, &len));    
    signal_buffer *buffer = signal_buffer_create(myRecord, len);

    *record = buffer;
    return 1;
}

int session_store_get_sub_device_sessions(signal_int_list **sessions, const char *name, size_t name_len, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    string dbPath(account->dbPath);

    signal_int_list *result = signal_int_list_alloc();
    if(!result) {
        return SG_ERR_NOMEM;
    }

    std::string recipientId = std::string(name, name_len);
    vector<CriptextDB::SessionRecord> sessionRecords = CriptextDB::getSessionRecords(dbPath, recipientId);

    for (std::vector<CriptextDB::SessionRecord>::iterator it = sessionRecords.begin(); it != sessionRecords.end(); ++it) {
      signal_int_list_push_back(result, it->deviceId);
    }

    *sessions = result;
    return 0;
}

int session_store_store_session(const signal_protocol_address *address, uint8_t *record, size_t record_len, uint8_t *user_record_data, size_t user_record_len, void *user_data)
{   
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    string dbPath(account->dbPath);

    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;

    size_t len = 0;
    const unsigned char *myRecord = reinterpret_cast<const unsigned char *>(record);
    char *recordBase64 = reinterpret_cast<char *>(base64_encode(myRecord, record_len, &len));

    bool success = CriptextDB::createSessionRecord(dbPath, recipientId, deviceId, recordBase64, len);
    return success ? 1 : 0;
}

int session_store_contains_session(const signal_protocol_address *address, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    string dbPath(account->dbPath);

    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;

    try {
        CriptextDB::getSessionRecord(dbPath, recipientId, deviceId);
    } catch (exception& e) {
        return 0;
    }

    return 1;
}

int session_store_delete_session(const signal_protocol_address *address, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    string dbPath(account->dbPath);

    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;
    bool success = CriptextDB::deleteSessionRecord(dbPath, recipientId, deviceId);

    return success ? 1 : 0;
}

int session_store_delete_all_sessions(const char *name, size_t name_len, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    string dbPath(account->dbPath);

    std::string recipientId = std::string(name, name_len);
    bool success = CriptextDB::deleteSessionRecords(dbPath, recipientId);

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