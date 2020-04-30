#!bin/bash
tempBuildFolder='deps'
lsbCommand='lsb_release'
lsbDebianFamily=("Debian Ubuntu Mint Kali")
lsbArch='Arch'

function PSM() {
  tput setaf 2;tput bold; echo "$1"; tput sgr0;
}
function PEM() {
  tput setaf 1;tput setab 7; echo "$1"; tput sgr0;
}
function removeTempFolder1() {
  cd ..; rm -rf "${tempBuildFolder}"; exit 1;
}
function removeTempFolder3() {
  cd ../../..; rm -rf "${tempBuildFolder}"; exit 1;
}

PEM "    This script will try to install some packages in your system."
PEM "    Plase use it only in a development environment."

while true; do
    read -p "    Do you want to continue? (Yes/No):" yn
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

if [[ " ${lsbDebianFamily[@]} " =~ " ${LSB_DISTRO} " ]]; then
  LD_FLAGS='/usr/lib/x86_64-linux-gnu/libcrypto.a'
  repoUpdate='apt-get update'
elif [ $LSB_DISTRO == $lsbArch ]; then
  LD_FLAGS='/usr/lib/libcrypto.so'
  repoUpdate='pacman -Sy'
else
  PEM "    Your distro is not supported yet: $LSB_DISTRO. Please install manually."
  exit 3
fi

# ================================================

sudo $repoUpdate > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to update repos list"
fi

# ================================================

printf "\n\n"
echo "----------------------------------------"
 PSM "            Signal Interface";
echo "----------------------------------------"
printf "  - Checking latest repos \n";

# ================================================

printf "  - Installing build dependencies \n";
if [[ " ${lsbDebianFamily[@]} " =~ " ${LSB_DISTRO} " ]]; then
  INSTALL_DEPS_ERROR=$( { sudo apt-get install libssl1.0-dev gcc cmake git pkg-config tcl -y > /dev/null; } 2>&1 )
elif [ $LSB_DISTRO == $lsbArch ]; then
  INSTALL_DEPS_ERROR=$( { sudo pacman -S --noconfirm base-devel cmake git pkg-config openssl tcl > /dev/null; } 2>&1 )
fi

if [ $? -ne 0 ]; then
  PEM "      Failed to install deps"
  echo "Reason: "; PEM $INSTALL_DEPS_ERROR;
  exit 1;
fi

# ================================================

printf "  - Preparing build \n";
mkdir "${tempBuildFolder}" > /dev/null
cd "${tempBuildFolder}" > /dev/null

# ================================================

printf "\n  - Downloading libsignal-protocol-c \n";
git clone "https://github.com/signalapp/libsignal-protocol-c.git" --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download libsignal-protocol-c";
  removeTempFolder1;
fi
printf "  - Creating build directory \n";
cd ./libsignal-protocol-c > /dev/null
mkdir build && cd build > /dev/null
printf "  - Making install libsignal-protocol-c \n";
cmake .. > /dev/null
sudo make -j4 install > /dev/null 2>&1;
if [ $? -ne 0 ]; then
  PEM "    Failed to make install libsignal-protocol-c";
  removeTempFolder3;
fi
cd ../..

# ================================================

printf "\n  - Downloading cJSON \n";
git clone "https://github.com/DaveGamble/cJSON.git" --quiet
if [ $? -ne 0 ]; then
  PEM "    Failed to download cJSON";
  removeTempFolder1;
fi
printf "  - Creating build directory \n";
cd ./cJSON > /dev/null
mkdir build && cd build > /dev/null
printf "  - Making install cJSON \n";
cmake -DBUILD_SHARED_LIBS=Off .. > /dev/null
sudo make -j4 install > /dev/null 2>&1
if [ $? -ne 0 ]; then
  PEM "    Failed to make install cJSON";
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
printf "  - Making install civetweb \n";
make slib > /dev/null
sudo cp include/* /usr/local/include/ > /dev/null
sudo cp libcivetweb.so* /usr/local/lib/ > /dev/null
make lib > /dev/null
sudo cp libcivetweb.a /usr/local/lib > /dev/null 
if [ $? -ne 0 ]; then
  PEM "    Failed to make install civetweb";
  removeTempFolder3;
fi
cd ..

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
sudo make -j4 install > /dev/null 2>&1;
if [ $? -ne 0 ]; then
  PEM "    Failed to make install spdlogs";
  removeTempFolder3;
fi
cd ../..

# ================================================

rm -rf "${tempBuildFolder}"
PSM "    Done.";
printf "\n"
