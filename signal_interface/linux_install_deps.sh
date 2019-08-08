#!bin/bash

apt-get update
apt-get install gcc -y
apt-get install cmake -y
apt-get install libssl1.0-dev -y
apt-get install git -y
apt-get install pkg-config -y

mkdir deps 
pushd deps

git clone https://github.com/signalapp/libsignal-protocol-c.git
pushd libsignal-protocol-c
mkdir build && cd build && cmake .. && make -j4 install
popd

git clone https://github.com/DaveGamble/cJSON.git
pushd cJSON
mkdir build && cd build && cmake -DBUILD_SHARED_LIBS=Off .. && make -j4 install
popd

git clone https://github.com/civetweb/civetweb.git
pushd civetweb
make slib  && cp include/* /usr/include/ && cp libcivetweb.so* /usr/lib/
popd

popd && rm -rf deps