#!bin/bash
tempBuildFolder='deps'
lsbCommand='lsb_release'
lsbDebian='Debian'
lsbArch='Arch'

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

PEM "    This script will try to install some packages in your system."
PEM "    Plase use it only in a development environment."

while true; do
    read -p "    Do you want to coninue? (Yes/No):" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

# Check lsb_release
which $lsbCommand > /dev/null 2>&1
RC=$?

if [ $RC -ne 0 ]; then
  PEM "    $lsbCommand not found"
  PEM "    Please, install lsb-release package"
  exit 1;
fi

LSB_DISTRO=$(lsb_release -is)

if [ $LSB_DISTRO == $lsbDebian ]; then
  LD_FLAGS='/usr/lib/x86_64-linux-gnu/libcrypto.a'
  repoUpdate='apt-get update'
elif [ $LSB_DISTRO == $lsbArch ]; then
  LD_FLAGS='/usr/lib/libcrypto.so'
  repoUpdate='pacman -Sy'
else
  PEM "    Your distro is not supported yet: $LSB_DISTRO. Please install manually."
  exit 3
fi

# Update repos list
sudo $repoUpdate > /dev/null;
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

if [ $LSB_DISTRO == $lsbDebian ]; then
  INSTALL_DEPS_ERROR=$( { sudo apt-get install gcc cmake git pkg-config sqlite3 libsqlite3-dev -y > /dev/null; } 2>&1 )
elif [ $LSB_DISTRO == $lsbArch ]; then
  INSTALL_DEPS_ERROR=$( { sudo pacman -S --noconfirm base-devel gcc cmake git pkg-config sqlite3 openssl tcl > /dev/null; } 2>&1 )
fi

if [ $? -ne 0 ]; then
  PEM "      Failed to install deps"
  echo "Reason: "; PEM $INSTALL_DEPS_ERROR;
  exit 2;
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

cd ..

printf "  - Downloading SQLCipher... \n";
git clone https://github.com/sqlcipher/sqlcipher.git --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download SQLCipher";
  removeTempFolder1;
fi

printf "  - Configurating... \n";
cd ./sqlcipher > /dev/null;
./configure --enable-tempstore=yes CFLAGS="-DSQLITE_HAS_CODEC" LDFLAGS="$LD_FLAGS";

make > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to make SQLCipher";
  exit;
fi

sudo make install > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to install SQLCipher";
  exit;
fi


# Exit to tempBuildFolder's parent and remove
removeTempFolder2;
PSM "    Done.";
printf "\n"
