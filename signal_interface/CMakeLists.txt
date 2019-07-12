cmake_minimum_required(VERSION 3.10)

set(OPENSSL_ROOT_DIR /usr/local/Cellar/openssl/1.0.2r)
set(DOPENSSL_LIBRARIES /usr/local/Cellar/openssl/1.0.2r/lib)
include_directories(/usr/local/Cellar/sqlite/3.28.0/include)
include_directories(${DOPENSSL_LIBRARIES})
include_directories(/usr/local/include)
link_directories(/usr/local/lib)

set(SOURCES
    main.cpp
    src/http/http.cpp
    src/http/handlers/decrypt.cpp
    src/http/handlers/keyBundle.cpp
    src/helpers/utf8.c
    src/crypto/crypto.c
    src/crypto/signal.cpp
    src/crypto/store.cpp
    src/crypto/base64.c
    src/crypto/protocol_store/IdentityKeyStore.cpp
    src/crypto/protocol_store/PreKeyStore.cpp
    src/crypto/protocol_store/SessionStore.cpp
    src/crypto/protocol_store/SignedPreKeyStore.cpp
    src/crypto/protocol_store/decode_utils.cpp
    ../../db_interface/src/axolotl/Account.cpp
    ../../db_interface/src/axolotl/IdentityKey.cpp
    ../../db_interface/src/axolotl/PreKey.cpp
    ../../db_interface/src/axolotl/SessionRecord.cpp
    ../../db_interface/src/axolotl/SignedPreKey.cpp)

find_package(OpenSSL REQUIRED)
find_package(sqlite3 REQUIRED)
find_package(iconv REQUIRED)

add_executable(alice ${SOURCES})

target_link_libraries(alice iconv)
target_link_libraries(alice OpenSSL::SSL)
target_link_libraries(alice pthread)
target_link_libraries(alice dl)
target_link_libraries(alice sqlite3)
target_link_libraries(alice SQLiteCpp)
target_link_libraries(alice signal-protocol-c m)
target_link_libraries(alice civetweb)
target_link_libraries(alice cjson)