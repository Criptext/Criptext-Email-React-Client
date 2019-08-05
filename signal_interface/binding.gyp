{
  "targets": [
    {
      "target_name": "alice",
      "type": "executable",
      "sources": [ 
        "main.cpp",
        "src/http/http.cpp",
        "src/http/handlers/helpers.cpp",
        "src/http/handlers/cors.cpp",
        "src/http/handlers/encrypt.cpp",
        "src/http/handlers/decrypt.cpp",
        "src/http/handlers/keyBundle.cpp",
        "src/helpers/utf8.c",
        "src/crypto/crypto.c",
        "src/crypto/signal.cpp",
        "src/crypto/store.cpp",
        "src/crypto/base64.c",
        "src/crypto/protocol_store/IdentityKeyStore.cpp",
        "src/crypto/protocol_store/PreKeyStore.cpp",
        "src/crypto/protocol_store/SessionStore.cpp",
        "src/crypto/protocol_store/SignedPreKeyStore.cpp",
        "src/crypto/protocol_store/decode_utils.cpp",
        "../db_interface/src/axolotl/Account.cpp",
        "../db_interface/src/axolotl/IdentityKey.cpp",
        "../db_interface/src/axolotl/PreKey.cpp",
        "../db_interface/src/axolotl/SessionRecord.cpp",
        "../db_interface/src/axolotl/SignedPreKey.cpp"
      ],
      "cflags": ["-Wall", "-std=c++11"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      "include_dirs" : [
        "/usr/local/include"
      ],
      "libraries": [
        "-pthread",
        "-dl"
        "/usr/local/Cellar/openssl/1.0.2r/lib/libssl.a",
        "/usr/local/Cellar/openssl/1.0.2r/lib/libcrypto.a",
        "/usr/local/Cellar/sqlite/3.28.0/lib/libsqlite3.a",
        "/usr/local/lib/libSQLiteCpp.a",
        "/usr/local/lib/libsignal-protocol-c.a",
        "/usr/local/lib/libcivetweb.a",
        "/usr/local/lib/libcjson.dylib"
      ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          }
        }]
      ]
    }
  ]
}