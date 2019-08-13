#!bin/sh
tempBuildFolder='deps'

# Update repos list
sudo apt-get update

# Install deps
sudo apt-get install libssl1.0-dev -y
# Optional deps. Required in db_interface folder
sudo apt-get install gcc cmake git pkg-config -y

# Temp build folder
mkdir "${tempBuildFolder}" && cd "${tempBuildFolder}"

# Download and build libsignal-protocol-c
git clone https://github.com/signalapp/libsignal-protocol-c.git
cd ./libsignal-protocol-c
mkdir build && cd build && cmake .. && sudo make -j4 install
cd ../..

# Download and build cJSON
git clone https://github.com/DaveGamble/cJSON.git
cd ./cJSON
mkdir build && cd build && cmake -DBUILD_SHARED_LIBS=Off .. && sudo make -j4 install
cd ../..

# Download and build civetweb
git clone https://github.com/civetweb/civetweb.git
cd ./civetweb
make slib
sudo cp include/* /usr/include/
sudo cp libcivetweb.so* /usr/lib/
cd ../..

# Remove temp folder
rm -rf "${tempBuildFolder}"
