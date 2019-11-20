#!bin/bash
if ! type "brew" > /dev/null; then
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi

brew install cmake > /dev/null;

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

# Temp folder
printf "  - Preparing build... \n";
mkdir "${tempBuildFolder}" > /dev/null;
cd "${tempBuildFolder}" > /dev/null;

echo "-----------------------------------------"
 PSM "             DB Interface";
echo "-----------------------------------------"

# Download && build sqlite_modern_cpp
printf "  - Downloading sqlite_modern_cpp... \n";
git clone https://github.com/SqliteModernCpp/sqlite_modern_cpp.git --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download sqlite_modern_cpp";
  removeTempFolder1;
fi

printf "  - Configuring and building sqlite_modern_cpp... \n";
cd ./sqlite_modern_cpp > /dev/null;

./configure > /dev/null
if [ $? -ne 0 ]; then
  PEM "    Failed to configure sqlite_modern_cpp";
  removeTempFolder2;
fi
make > /dev/null
if [ $? -ne 0 ]; then
  PEM "    Failed to make sqlite_modern_cpp";
  removeTempFolder2;
fi
sudo make install > /dev/null
if [ $? -ne 0 ]; then
  PEM "    Failed to install sqlite_modern_cpp";
  removeTempFolder2;
fi

# Exit to tempBuildFolder's parent and remove
removeTempFolder2;
PSM "    Done.";