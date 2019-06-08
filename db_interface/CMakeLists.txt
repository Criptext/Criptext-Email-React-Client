set(SOURCES
    src/main.cpp
    src/axolotl/IdentityKey.cpp
    src/axolotl/PreKey.cpp
    src/axolotl/SessionRecord.cpp
    src/axolotl/SignedPreKey.cpp)

include_directories(/usr/local/include/SQLiteCpp)

add_executable(axolotl ${SOURCES})

target_link_libraries(axolotl pthread)
target_link_libraries(axolotl dl)
target_link_libraries(axolotl SQLiteCpp)
target_link_libraries(axolotl sqlite3)
