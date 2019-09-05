{
  "targets": [
    {
      "target_name": "trompita",
      "type": "executable",
      "sources": [ 
        "main.cpp",
        "../src/http/http.cpp",
        "../src/http/handlers/cors.cpp",
        "../src/http/handlers/readDB.cpp",
        "../../signal_interface/src/http/handlers/helpers.cpp",
        "../src/axolotl/Account.cpp",
        "../src/axolotl/AppSettings.cpp",
        "../src/axolotl/Contact.cpp",
        "../src/axolotl/CRFile.cpp",
        "../src/axolotl/DBUtils.cpp",
        "../src/axolotl/Email.cpp",
        "../src/axolotl/EmailContact.cpp",
        "../src/axolotl/EmailLabel.cpp",
        "../src/axolotl/FeedItem.cpp",
        "../src/axolotl/FullEmail.cpp",
        "../src/axolotl/Label.cpp",
        "../src/axolotl/PendingEvent.cpp",
        "../src/axolotl/Thread.cpp",
      ],
      "cflags": ["-Wall", "-std=c++17", "-rdynamic", "-stdlib=libc++"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      "include_dirs" : [
         # Include system & SQLite headers
        "/usr/local/include"
      ],
      "libraries": [
        "-pthread",
        "-ldl",
        # Check this following paths on your system
        "/usr/local/Cellar/openssl/1.0.2s/lib/libssl.a",
        "/usr/local/Cellar/openssl/1.0.2s/lib/libcrypto.a",
        "/usr/local/Cellar/sqlite/3.28.0/lib/libsqlite3.a",
        "/usr/local/lib/libSQLiteCpp.a",
        "/usr/local/lib/libsignal-protocol-c.a",
        "/usr/local/lib/libcivetweb.a",
        "/usr/local/lib/libcjson.a",
        "/usr/local/lib/spdlog/libspdlog.a",
      ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'OTHER_CPLUSPLUSFLAGS' : [ '-std=c++17', '-stdlib=libc++' ],
            'OTHER_LDFLAGS': [ '-stdlib=libc++' ],
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          }
        }]
      ]
    }
  ]
}