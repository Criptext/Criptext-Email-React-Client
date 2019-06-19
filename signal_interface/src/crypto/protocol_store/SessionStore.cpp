#include "SessionStore.h"
#include "../store.h"
#include "../uthash.h"
#include <string>
#include <vector>
#include <iostream>

int session_store_load_session(signal_buffer **record, signal_buffer **user_record, const signal_protocol_address *address, void *user_data)
{
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;
    CriptextDB::SessionRecord sessionRecord;

    try {
        sessionRecord = CriptextDB::getSessionRecord("Criptext.db", account->id, recipientId, deviceId);
    } catch (exception& e) {
        return 0;
    }
    
    const uint8_t* recordData = reinterpret_cast<const uint8_t*>(sessionRecord.record.c_str());
    signal_buffer *result = signal_buffer_create(recordData, sizeof(recordData));
    if(!result) {
        return SG_ERR_NOMEM;
    }
    *record = result;
    return 1;
}

int session_store_get_sub_device_sessions(signal_int_list **sessions, const char *name, size_t name_len, void *user_data)
{
    std::cout << "GET SUB DEVICE" << std::endl;
    signal_int_list *result = signal_int_list_alloc();
    if(!result) {
        return SG_ERR_NOMEM;
    }

    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    std::string recipientId = std::string(name, name_len);
    vector<CriptextDB::SessionRecord> sessionRecords = CriptextDB::getSessionRecords("Criptext.db", account->id, recipientId);

    for (std::vector<CriptextDB::SessionRecord>::iterator it = sessionRecords.begin(); it != sessionRecords.end(); ++it) {
      signal_int_list_push_back(result, it->deviceId);
    }

    *sessions = result;
    return 0;
}

int session_store_store_session(const signal_protocol_address *address, uint8_t *record, size_t record_len, uint8_t *user_record_data, size_t user_record_len, void *user_data)
{
    std::cout << "STORE SESSION" << std::endl;
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;

    //session_record *sessionRecord = 0;
    //session_record_deserialize(&sessionRecord, record, record_len, 0);

    std::string myRecord = std::string(reinterpret_cast<char *>(record));
    std::cout << myRecord << std::endl;
    bool success = CriptextDB::createSessionRecord("Criptext.db", account->id, recipientId, deviceId, myRecord);

    return success ? 1 : 0;
}

int session_store_contains_session(const signal_protocol_address *address, void *user_data)
{
    std::cout << "CONTAINS" << std::endl;
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;

    try {
        CriptextDB::getSessionRecord("Criptext.db", account->id, recipientId, deviceId);
    } catch (exception& e) {
        return 0;
    }

    return 1;
}

int session_store_delete_session(const signal_protocol_address *address, void *user_data)
{
    std::cout << "DELETE SESSION" << std::endl;
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;
    bool success = CriptextDB::deleteSessionRecord("Criptext.db", account->id, recipientId, deviceId);

    return success ? 1 : 0;
}

int session_store_delete_all_sessions(const char *name, size_t name_len, void *user_data)
{
    std::cout << "DELETE ALL SESSIONS" << std::endl;
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    std::string recipientId = std::string(name, name_len);
    bool success = CriptextDB::deleteSessionRecords("Criptext.db", account->id, recipientId);

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