#!/bin/sh

has_error=0
isSupported=0
installerTypeDefaultValue="DEVELOPMENT";
entitlementsOriginalFileName="entitlements.mac.plist"
entitlementsBackupFileName="backup-entitlements.mac.plist"
# Folders
linuxInstallerFolderName="LinuxInstaller"
macInstallerFolderName="MacInstaller"
macStoreFolderName="MacStore"
windowsInstallerFolderName="WindowsInstaller"
windowsStoreFolderName="WindowsStore"



echo "----------------------------------------------------";
tput setaf 3;tput bold; echo "                 Generating installer"; tput sgr0;
echo "----------------------------------------------------"

# Make a package.json backup 
cp ./package.json ./backup.json

# Clear previous installer folder
rm -rf ./dist

# Get OS
CURRENT_OS=$( uname )

if [ "$CURRENT_OS" = "Linux" ]; then    
    echo "    OS:    Linux";
    isSupported=1;
    # Update package.json
    linuxInstallerType=$( cat ./installerResources/installerTypes.json | json "linux.installer" )
    json -I -f ./package.json -e "this.criptextInstallerType=\"${linuxInstallerType}\"" -q
    printf "    Updated package.json \n";
    printf "        -> Installer-type:  ${linuxInstallerType} \n";
    echo "    Executing:    yarn build";
    yarn build > /dev/null;
    # Move to subfolder
    printf "    Making a copy... \n";
    cd ./dist
    mkdir "${linuxInstallerFolderName}"
    cp -f `ls | grep -e *.AppImage -e *.yml` "./${linuxInstallerFolderName}"
    cp ./Criptext-*.AppImage "./${linuxInstallerFolderName}/Criptext-latest.AppImage"
    rm -rf `ls -A | grep -v -e ${linuxInstallerFolderName}`
    cd ..
    tput setaf 2;tput bold; echo "    Done"; tput sgr0;

elif [ "$CURRENT_OS" = "Darwin" ]; then
    echo "    OS:    MacOS";
    isSupported=1;
    # Load environment variables
    source ./.env
    # Update package.json
    macStoreType=$( cat ./installerResources/installerTypes.json | json "mac.store" )
    json -I -f ./package.json -e "this.criptextInstallerType=\"${macStoreType}\"" -q
    json -I -f ./package.json -e 'this.build.mac.target=["mas"]' -q
    printf "    Updated package.json \n";
    printf "        -> Installer-type:  ${macStoreType} \n";
    printf "        -> Current target:  MAS \n";
    # Building
    printf "    Executing:    yarn build \n";
    yarn build > /dev/null;
    # Move to subfolder
    printf "    Moving to subfolder... \n";
    cd ./dist
    mkdir "${macStoreFolderName}"
    cp -rf `ls -A | grep -v ${macStoreFolderName}` "./${macStoreFolderName}"
    rm -rf `ls -A | grep -v ${macStoreFolderName}`
    cd ..
    tput setaf 2;tput bold; echo "    Store done"; tput sgr0;

    # Update package.json
    macInstallerType=$( cat ./installerResources/installerTypes.json | json "mac.installer" )
    json -I -f ./package.json -e "this.criptextInstallerType=\"${macInstallerType}\"" -q
    json -I -f ./package.json -e 'this.build.mac.target=["dmg", "zip"]' -q
    printf "\n    Updated package.json \n";
    printf "        -> Installer-type:  ${macInstallerType} \n";
    printf "        -> Current target:  DMG & ZIP \n";
    mv "build/${entitlementsOriginalFileName}" "build/${entitlementsBackupFileName}";
    printf "    Renamed [${entitlementsOriginalFileName}] to [${entitlementsBackupFileName}] \n";
    # Building
    printf "    Executing:    yarn build \n";
    yarn build > /dev/null;
    # Move to subfolder
    printf "    Making a copy... \n";
    cd ./dist;
    mkdir "${macInstallerFolderName}";
    cp -rf `ls -A | grep -v -e ${macInstallerFolderName} -e ${macStoreFolderName} -e *.blockmap -e *.json` "./${macInstallerFolderName}";
    cp Criptext-*.dmg "${macInstallerFolderName}/Criptext-latest.dmg";
    rm -rf `ls -A | grep -v -e ${macInstallerFolderName} -e ${macStoreFolderName}`;
    cd ..
    mv "build/${entitlementsBackupFileName}" "build/${entitlementsOriginalFileName}";
    printf "    Renamed [${entitlementsBackupFileName}] to [${entitlementsOriginalFileName}] \n ";
    tput setaf 2;tput bold; echo "    Installer done"; tput sgr0;


else
	printf "    OS:    Windows \n\n";
    isSupported=1;
    # Check USB token
    tput setaf 3; echo "    Plug the USB token. Press any key to continue..."; tput sgr0;
    read temp_var;
    # Load environment variables
    source ./.env
    # Update package.json
    windowsInstallerType=$( cat ./installerResources/installerTypes.json | json "windows.installer" )
    json -I -f ./package.json -e "this.criptextInstallerType=\"${windowsInstallerType}\"" -q
    json -I -f ./package.json -e 'this.build.win.target=["nsis"]' -q
    printf "    Updated package.json \n";
    printf "        -> Installer-type:  ${windowsInstallerType} \n";
    printf "        -> Current target:  Nsis \n";
    # Building
    printf "    Executing:    yarn build";
    yarn build > /dev/null;
    # Move to subfolder
    printf "\n    Making a copy... \n\n";
    cd ./dist
    mkdir WindowsInstaller
    cp `find . -maxdepth 1 -type f` ./WindowsInstaller
    cp ./Criptext-*.exe ./WindowsInstaller/Criptext-latest.exe
    rm -f ./WindowsInstaller/builder*.yaml
    rm -rf `ls -A | grep -v WindowsInstaller`
    cd ..
    tput setaf 2;tput bold; echo "    Installer done"; tput sgr0;

    # Update package.json
    windowsStoreType=$( cat ./installerResources/installerTypes.json | json "windows.store" )
    json -I -f ./package.json -e "this.criptextInstallerType=\"${windowsStoreType}\"" -q
    json -I -f ./package.json -e 'this.build.win.target=["appx"]' -q
    json -I -f ./package.json -e 'delete this.build.win.certificateSubjectName' -q;
    json -I -f ./package.json -e "this.build.appx.publisher=\"${WIN_STORE_DEVELOPER_ID}\"" -q
    printf "\n    Updated package.json \n";
    printf "        -> Installer-type:  ${windowsStoreType} \n";
    printf "        -> Current target:  AppX \n";
    printf "        -> Publisher:       ${WIN_STORE_DEVELOPER_ID} \n";
    # Building
    printf "    Executing:    yarn build";
    yarn build > /dev/null;
    # Move to subfolder
    printf "\n    Making a copy... \n\n";
    cd ./dist
    mkdir WindowsStore
    cp `find . -maxdepth 1 -type f` ./WindowsStore
    rm -f ./WindowsStore/builder*.yaml
    rm -rf `find . -maxdepth 1 -type f`;
    rm -rf ./win-unpacked;
    cd ..
    tput setaf 2;tput bold; echo "    Store done"; tput sgr0;

fi


# Set default criptextInstallerType
json -I -f ./package.json -e "this.criptextInstallerType=\"${installerTypeDefaultValue}\"" -q
# Remove modified package.json 
rm -f ./package.json
# Restore original package.json
mv ./backup.json ./package.json

if [ $has_error -ne 1 ] && [ $isSupported -ne 0 ]; then
    echo "";
    echo "----------------------------------------------------"
    tput setaf 2;tput bold;
    echo "                    Success!"; tput sgr0;
    echo "----------------------------------------------------"
fi
tput sgr0;