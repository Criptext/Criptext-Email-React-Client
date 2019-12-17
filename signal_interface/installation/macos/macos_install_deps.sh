#!bin/bash

if ! type "brew" > /dev/null; then
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi

brew install openssl > /dev/null;
brew install sqlite3 > /dev/null;

echo 'export PATH="/usr/local/opt/sqlite/bin:$PATH"' >> ~/.bash_profile
export LDFLAGS="-L/usr/local/opt/sqlite/lib"
export CPPFLAGS="-I/usr/local/opt/sqlite/include"

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

echo "----------------------------------------"
 PSM "            Signal Interface";
echo "----------------------------------------"

# Temp folder
printf "  - Preparing build... \n";
mkdir "${tempBuildFolder}" > /dev/null;
cd "${tempBuildFolder}" > /dev/null;

# ================================================

printf "\n  - Downloading libsignal-protocol-c \n";
git clone "https://github.com/signalapp/libsignal-protocol-c.git" --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download libsignal-protocol-c    ";
  removeTempFolder1;
fi
printf "  - Creating build directory \n";
cd ./libsignal-protocol-c > /dev/null
mkdir build && cd build > /dev/null
printf "  - Making install libsignal-protocol-c \n";
cmake .. > /dev/null
make -j4 install > /dev/null
if [ $? -ne 0 ]; then
  PEM "    Failed to make install libsignal-protocol-c    ";
  removeTempFolder3;
fi
cd ../..

# ================================================

printf "\n  - Downloading SQLCipher \n";
git clone "https://github.com/sqlcipher/sqlcipher.git" --quiet
if [ $? -ne 0 ]; then
  PEM "    Failed to download SQLCipher    ";
  removeTempFolder1;
fi
printf "  - Creating build directory \n";
cd ./sqlcipher > /dev/null
mkdir build && cd build > /dev/null
printf "  - Configuring SQLCipher \n";
../configure --enable-tempstore=yes --enable-static=yes  CFLAGS="-L/usr/local/opt/openssl/lib -I/usr/local/opt/openssl/include -DSQLITE_HAS_CODEC -DSQLITE_TEMP_STORE=2" LDFLAGS="-lcrypto" > /dev/null
printf "  - Making install SQLCipher \n";
make
make install > /dev/null 2>&1
if [ $? -ne 0 ]; then
  PEM "    Failed to make install SQLCipher    ";
  removeTempFolder3;
fi
cd ../..

# ================================================

printf "\n  - Downloading cJSON \n";
git clone "https://github.com/DaveGamble/cJSON.git" --quiet
if [ $? -ne 0 ]; then
  PEM "    Failed to download cJSON    ";
  removeTempFolder1;
fi
printf "  - Creating build directory \n";
cd ./cJSON > /dev/null
mkdir build && cd build > /dev/null
printf "  - Making install cJSON \n";
cmake -DBUILD_SHARED_LIBS=Off .. > /dev/null
make -j4 install > /dev/null 2>&1
if [ $? -ne 0 ]; then
  PEM "    Failed to make install cJSON    ";
  removeTempFolder3;
fi
cd ../..

# ================================================

printf "\n  - Downloading civetweb \n";
git clone "https://github.com/civetweb/civetweb.git" --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download civetweb";
  removeTempFolder1;
fi
printf "  - Preparing build \n";
cd ./civetweb > /dev/null
mkdir myBuild && cd myBuild > /dev/null;
printf "  - Making install civetweb \n";
cmake .. > /dev/null
make -j4 install > /dev/null 2>&1;
if [ $? -ne 0 ]; then
  PEM "    Failed to make install civetweb";
  removeTempFolder3;
fi
cd ../..

# ================================================

printf "\n  - Downloading spdlog \n";
git clone "https://github.com/gabime/spdlog.git" --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download spdlog";
  removeTempFolder1;
fi
printf "  - Preparing build \n";
cd ./spdlog > /dev/null
mkdir myBuild && cd myBuild > /dev/null;
printf "  - Making install spdlog \n";
cmake .. > /dev/null
make -j4 install > /dev/null 2>&1;
if [ $? -ne 0 ]; then
  PEM "    Failed to make install spdlogs";
  removeTempFolder3;
fi
cd ../..

# ================================================

rm -rf "${tempBuildFolder}"
PSM "    Done.";
printf "\n"