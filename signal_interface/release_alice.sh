#!bin/bash
isSupported=0

function PEM() {
  tput setaf 1;tput setab 7; echo "$1"; tput sgr0;
}
function PSM() {
  tput setaf 2;tput bold; echo "$1"; tput sgr0;
}

echo "-------------------------------------------";
 PSM "            Generating 'Alice'"
echo "-------------------------------------------"

# Get OS
CURRENT_OS=$( uname )

if [ "$CURRENT_OS" = "Linux" ]; then
  printf "  - OS:    Linux \n"
  isSupported=1;
  cp .installation/linux/linux_binding.gyp ./binding.gyp


elif [ "$CURRENT_OS" = "Darwin" ]; then
  printf "  - OS:    MacOS \n\n";
  isSupported=1;
  cp .installation/macos/macos_binding.gyp ./binding.gyp

else
	printf "  - OS:    Windows \n\n";
  isSupported=1;
  cp ./windows_binding.gyp ./binding.gyp

fi

if [ $isSupported -ne 1 ]; then
    PEM "    OS not supported"
    exit 1;
fi
printf "  - Binding file defined\n"

printf "  - Generating build\n"
node-gyp configure build > /dev/null 2>&1;
if [ $? -ne 0 ]; then
  PEM "    Failed to build 'alice'";
  rm -rf ./build
  rm -f ./binding.gyp
  exit 1;
fi

rm -f ./binding.gyp

PSM "    Done.";
printf "\n\n  - See result in: build/Release \n\n"