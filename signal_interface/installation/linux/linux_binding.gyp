{
  "targets": [
    {
      "target_name": "criptext-encryption-service",
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
      "cflags": ["-Wall", "-std=c++17", "-fno-strict-aliasing"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      "cflags_cc": ["-std=c++17"],
      "include_dirs" : [
        "/usr/local/include",
        "/usr/include"
      ],
      "libraries": [
        "-static-libstdc++",
        "-pthread",
        "-ldl",
        "/usr/lib/x86_64-linux-gnu/libssl.a",
        "/usr/lib/x86_64-linux-gnu/libcrypto.a",
        "/usr/lib/x86_64-linux-gnu/libsqlite3.a",
        "/home/criptext/Pedro/git/civetweb/libcivetweb.a",
        "/usr/lib/libcivetweb.so",
        "/usr/local/lib/libcjson.a",
        "/usr/local/lib/libspdlog.a"
      ]
    }
  ]
}