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
function removeTempFolder2() {
  cd ../..; rm -rf "${tempBuildFolder}"; return;
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
INSTALL_DEPS_ERROR=$( { sudo apt-get install gcc cmake git pkg-config sqlite3 libsqlite3-dev -y > /dev/null; } 2>&1 )

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
printf "  - Downloading SQLite Modern Cpp... \n";
git clone https://github.com/SqliteModernCpp/sqlite_modern_cpp.git --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download SQLite Modern Cpp";
  removeTempFolder1;
fi

printf "  - Configurating... \n";
cd ./sqlite_modern_cpp > /dev/null;
./configure;

make > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to make SQLite Modern Cpp";
  removeTempFolder2;
fi

sudo make install > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to install SQLite Modern Cpp";
  removeTempFolder2;
fi

# Exit to tempBuildFolder's parent and remove
removeTempFolder2;
PSM "    Done.";
printf "\n"