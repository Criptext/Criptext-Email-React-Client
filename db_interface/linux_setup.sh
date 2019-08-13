#!bin/sh
tempBuildFolder='deps'

# Update repos list
# - 'sudo' is required
sudo apt-get update

# Install deps
sudo apt-get install gcc cmake git pkg-config -y

# Temp folder
mkdir "${tempBuildFolder}" && cd "${tempBuildFolder}"

# Download && build SQLite
git clone https://github.com/SRombauts/SQLiteCpp
cd ./SQLiteCpp
mkdir build && cd build
cmake -DSQLITECPP_BUILD_EXAMPLES=OFF -DSQLITECPP_BUILD_TESTS=OFF ..
cmake --build . # Ignore Warnings
sudo make install
ctest --output-on-failure

# Exit to tempBuildFolder's parent
cd ../../..

# Remove temp folder
rm -rf "${tempBuildFolder}"