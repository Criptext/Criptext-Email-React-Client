#!bin/bash

apt-get update
apt-get install gcc -y
apt-get install cmake -y
apt-get install git -y
apt-get install pkg-config -y

mkdir deps 
pushd deps

git clone https://github.com/SRombauts/SQLiteCpp
pushd SQLiteCpp
mkdir build && pushd build
cmake -DSQLITECPP_BUILD_EXAMPLES=OFF -DSQLITECPP_BUILD_TESTS=OFF ..
cmake --build . && make install
ctest --output-on-failure
popd

popd
rm -rf deps