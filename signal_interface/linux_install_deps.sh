#!bin/bash

sudo apt-get update
sudo apt-get install libssl-dev -y
npm install -g node-gyp

mkdir deps 
cd deps

git clone https://github.com/signalapp/libsignal-protocol-c.git
cd libsignal-protocol-c
mkdir build && cd build && cmake .. && make -j4 install
cd ../..

git clone https://github.com/DaveGamble/cJSON.git
cd cJSON
mkdir build && cd build && cmake -DBUILD_SHARED_LIBS=Off .. && sudo make -j4 install
cd ../../

git clone https://github.com/civetweb/civetweb.git
cd civetweb
make slib  && sudo cp include/* /usr/include/ && sudo cp libcivetweb.so* /usr/lib/

cd ../../..
rm -rf deps