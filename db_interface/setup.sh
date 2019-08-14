#!bin/bash

sudo apt-get update
sudo apt-get install gcc cmake git pkg-config sqlite3 libsqlite3-dev -y

mkdir deps 
cd deps

git clone https://github.com/SRombauts/SQLiteCpp
cd SQLiteCpp
mkdir build && cd build
cmake -DSQLITECPP_BUILD_EXAMPLES=OFF -DSQLITECPP_BUILD_TESTS=OFF ..
cmake --build . && make install
ctest --output-on-failure
cd ../..

rm -rf deps