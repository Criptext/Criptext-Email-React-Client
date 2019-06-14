cmake_minimum_required(VERSION 3.10)
set(SOURCES
    main.cpp
    src/http/http.cpp
    src/http/handlers/decrypt.cpp
    src/crypto/crypto.c
    src/crypto/signal.cpp
    src/crypto/store.cpp
    src/crypto/base64.c
    src/crypto/protocol_store/IdentityKeyStore.cpp
    src/crypto/protocol_store/PreKeyStore.cpp
    src/crypto/protocol_store/SessionStore.cpp
    src/crypto/protocol_store/SignedPreKeyStore.cpp
    ../../db_interface/src/axolotl/Account.cpp
    ../../db_interface/src/axolotl/IdentityKey.cpp
    ../../db_interface/src/axolotl/PreKey.cpp
    ../../db_interface/src/axolotl/SessionRecord.cpp
    ../../db_interface/src/axolotl/SignedPreKey.cpp)

find_package(OpenSSL REQUIRED)

add_executable(alice ${SOURCES})

target_link_libraries(alice OpenSSL::SSL)
target_link_libraries(alice pthread)
target_link_libraries(alice dl)
target_link_libraries(alice SQLiteCpp)
target_link_libraries(alice sqlite3)
target_link_libraries(alice signal-protocol-c m)
target_link_libraries(alice civetweb)
target_link_libraries(alice cjson)