#!bin/bash
tempBuildFolder='deps'

function PSM() {
  tput setaf 2;tput bold; echo "$1"; tput sgr0;
}
function PEM() {
  tput setaf 1;tput setab 7; echo "$1"; tput sgr0;
}
function removeTempFolder1() {
  cd ..; rm -rf "${tempBuildFolder}"; return;
}
function removeTempFolder3() {
  cd ../../..; rm -rf "${tempBuildFolder}"; return;
}

# Update repos list
sudo apt-get update > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to update repos list"
fi
printf "\n\n"

echo "-----------------------------------------"
 PSM "             DB Interface";
echo "-----------------------------------------"

printf "  - Checking latest repos... \n";


# Install deps
printf "  - Installing build dependencies... \n";
INSTALL_DEPS_ERROR=$( { sudo apt-get install gcc cmake git pkg-config -y > /dev/null; } 2>&1 )

if [ $? -ne 0 ]; then
  PEM "      Failed to install deps"
  echo "Reason: "; PEM $INSTALL_DEPS_ERROR;
  return;
fi

# Temp folder
printf "  - Preparing build... \n";
mkdir "${tempBuildFolder}" > /dev/null;
cd "${tempBuildFolder}" > /dev/null;

# Download && build SQLite
printf "  - Downloading SQLiteCpp... \n";
git clone https://github.com/SRombauts/SQLiteCpp --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download SQLiteCpp";
  removeTempFolder1;
fi

printf "  - Creating build directory... \n";
cd ./SQLiteCpp > /dev/null;
mkdir build && cd build > /dev/null;

cmake -DSQLITECPP_BUILD_EXAMPLES=OFF -DSQLITECPP_BUILD_TESTS=OFF .. > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to make SQLiteCpp";
  removeTempFolder3;
fi

# Ignore Warnings
cmake --build . > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to build SQLiteCpp";
  removeTempFolder3;
fi

sudo make install > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to install SQLiteCpp";
  removeTempFolder3;
fi

# Exit to tempBuildFolder's parent and remove
removeTempFolder3;
PSM "    Done.";
printf "\n"