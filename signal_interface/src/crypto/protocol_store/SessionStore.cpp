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
    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;
    CriptextDB::SessionRecord sessionRecord;

    try {
        sessionRecord = CriptextDB::getSessionRecord("Criptext.db", account->id, recipientId, deviceId);
    } catch (exception& e) {
        return 0;
    }
    
    /* const uint8_t* recordData = reinterpret_cast<const uint8_t*>(sessionRecord.record.c_str());
    signal_buffer *result = signal_buffer_create(recordData, sizeof(recordData));
    if(!result) {
        return SG_ERR_NOMEM;
    }
    *record = result;*/
    return 0;
    //return 1;
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

char *convert_bytes_to_binary_string( uint8_t *bytes, size_t count ) {
  if ( count < 1 ) {
    return NULL;
  }

  const char *table[] = {
    "0000", "0001", "0010", "0011",
    "0100", "0101", "0110", "0111",
    "1000", "1001", "1010", "1011",
    "1100", "1101", "1110", "1111"
  };

  size_t buffer_size = 8 * count + 1;
  char *buffer = (char *)malloc( buffer_size );
  if ( buffer == NULL ) {
    return NULL;
  }

  char *output = buffer;
  for ( int i = 0 ; i < count ; i++ ) {
    memcpy( output, table[ bytes[i] >> 4 ], 4 );
    output += 4;
    memcpy( output, table[ bytes[i] & 0x0F ], 4 );
    output += 4;
  }

  *output = 0;

  return buffer;
};

std::string uniEncode(char *incomingChar) {
    char *textChar = reinterpret_cast<char *>(incomingChar);
    char *textU = 0;
    size_t recordSize = 1000;
    textU = (char *) malloc(recordSize);
    u8_escape(textU, recordSize, textChar, 0);
    std::cout << "=======================\n" << std::string(incomingChar) << "\n--:--\n" << textU << std::endl;

    char *textU2 = 0;
    textU2 = (char *) malloc(recordSize);
    u8_unescape(textU2, recordSize, textU);

    std::cout << "--:--\n" << textU2 << std::endl;

    std::string textString(textU);
    free(textU);
    textU = 0;

    return textString;
}

std::string build_session_record_string(session_record *sessionRecord) {
    std::cout << "BROER" << std::endl;
    
    std::string chainKey = uniEncode(reinterpret_cast<char *>(sessionRecord->state->receiver_chain_head->chain_key->key));
    std::string chainKeyCounter;
    if (!sessionRecord->state->receiver_chain_head->message_keys_head) {
        chainKeyCounter = "0";
    } else {
        chainKeyCounter = std::to_string(sessionRecord->state->receiver_chain_head->message_keys_head->message_key.counter);
    }

    std::string senderChainKey = uniEncode(reinterpret_cast<char *>(sessionRecord->state->sender_chain.chain_key->key));
    std::string senderRatchetPrivKey = uniEncode(reinterpret_cast<char *>(&sessionRecord->state->sender_chain.sender_ratchet_key_pair->private_key->data));
    std::string senderRatchetPubKey = uniEncode(reinterpret_cast<char *>(&sessionRecord->state->sender_chain.sender_ratchet_key_pair->public_key->data));
    std::string baseKey = uniEncode(reinterpret_cast<char *>(&sessionRecord->state->alice_base_key->data));

    std::string lastRemoteEphemeralKey = uniEncode(reinterpret_cast<char *>(&sessionRecord->state->receiver_chain_head->sender_ratchet_key->data));

    std::string previousCounter = std::to_string(sessionRecord->state->previous_counter);
    std::string rootKey = uniEncode(reinterpret_cast<char *>(sessionRecord->state->root_key->key));

    std::string version = std::to_string(sessionRecord->state->session_version);
    std::string regId = std::to_string(sessionRecord->state->remote_registration_id);

    std::string remotePublicKey = uniEncode(reinterpret_cast<char *>(&sessionRecord->state->remote_identity_public->data));

    //std::cout << "YAS" << std::endl;
    //std::string yasabe = uniEncode(reinterpret_cast<char *>(&sessionRecord->state->));


    std::string sessionJson = "{"
        "\\\"sessions\\\":{"
            "\\\"" + baseKey + "\\\":{"
                "\\\"" + lastRemoteEphemeralKey + "\\\":{"
                    "\\\"chainKey\\\":{"
                        "\\\"key\\\":" + chainKey + "\\\"" //right
                        "\\\"counter\\\":" + chainKeyCounter + "\\\"" //right
                    "},"
                    "\\\"chainType\\\": 2,"
                    "\\\"messageKeys\\\":{}"
                "},"
                "\\\"" + senderRatchetPubKey + "\\\":{"
                    "\\\"chainKey\\\":{"
                        "\\\"key\\\":\\\"" + senderChainKey + "\\\""
                        "\\\"counter\\\":-1"
                    "},"
                    "\\\"chainType\\\":1,"
                    "\\\"messageKeys\\\":{}"
                "},"
                "\\\"currentRatchet\\\":{"
                    "\\\"previousCounter\\\":\\\"" + previousCounter + "\\\"," //right
                    "\\\"rootKey\\\":" + rootKey + ","
                    "\\\"ephemeralKeyPair\\\":{"
                        "\\\"privKey\\\":\\\"" + senderRatchetPrivKey + "\\\","
                        "\\\"pubKey\\\":\\\"" + senderRatchetPubKey + "\\\""
                    "},"
                    "\\\"lastRemoteEphemeralKey\\\":" + lastRemoteEphemeralKey + "\\\""
                "},"
                "\\\"indexInfo\\\":{"
                    "\\\"baseKey\\\":\\\"" + baseKey +  "\\\","
                    "\\\"remoteIdentityKey\\\":" + remotePublicKey + "," //right
                    "\\\"closed\\\":-1,"
                    "\\\"baseKeyType\\\":2"
                "},"
                "\\\"registrationId\\\":" + regId + //right
            "}"
        "},"
        "\\\"version\\\": \\\"" + version + "\\\"" 
    "}";

    return sessionJson;
}

int session_store_store_session(const signal_protocol_address *address, uint8_t *record, size_t record_len, uint8_t *user_record_data, size_t user_record_len, void *user_data)
{
    std::cout << "STORE SESSION" << std::endl;
    CriptextDB::Account *account = (CriptextDB::Account*)user_data;
    std::string recipientId = std::string(address->name);
    int deviceId = address->device_id;

    signal_context *global_context = 0;
    signal_context_create(&global_context, 0);
    session_record *sessionRecord = 0;
    session_record_deserialize(&sessionRecord, record, record_len, global_context);

    std::string mySessionRecord = build_session_record_string(sessionRecord);
    bool success = CriptextDB::createSessionRecord("Criptext.db", account->id, recipientId, deviceId, mySessionRecord);
    std::cout << mySessionRecord << std::endl;
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