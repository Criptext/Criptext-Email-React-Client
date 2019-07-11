#!bin/bash

if ! type "brew" > /dev/null; then
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi

brew install openssl
brew install sqlite3
echo 'export PATH="/usr/local/opt/sqlite/bin:$PATH"' >> ~/.bash_profile
export LDFLAGS="-L/usr/local/opt/sqlite/lib"
export CPPFLAGS="-I/usr/local/opt/sqlite/include"

mkdir deps 
cd deps

git clone https://github.com/signalapp/libsignal-protocol-c.git
cd libsignal-protocol-c
mkdir build && cd build && cmake .. && make -j4 install
cd ..

git clone https://github.com/DaveGamble/cJSON.git
cd cJSON
mkdir build && cd build && cmake .. && make -j4 install
cd ..

git clone https://github.com/civetweb/civetweb.git
cd civetweb
mkdir myBuild && cd myBuild && cmake .. && make -j4 install
cd ..

cd .. && rm -rf deps