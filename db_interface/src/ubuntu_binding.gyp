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
      "cflags": ["-Wall", "-std=c++1z"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'cflags_cc': ["-std=c++1z", "-libstdc++"],
      "include_dirs" : [
         # Include system & SQLite headers
        "/usr/local/include"
      ],
      "libraries": [
        "-pthread",
        "-ldl"
        # Check this following paths on your system
        "/usr/lib/x86_64-linux-gnu/libssl.a",
        "/usr/lib/x86_64-linux-gnu/libcrypto.a",
        "/usr/lib/x86_64-linux-gnu/libsqlite3.a",
        "/usr/local/lib/libSQLiteCpp.a",
        "/usr/lib/libcivetweb.so",
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