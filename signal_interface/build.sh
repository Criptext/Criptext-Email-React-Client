node-gyp configure build

cp ./installation/criptext-encryption-service.desktop ./build/Release
cp ./installation/icon.png ./build/Release
cd build
mv ./Release/criptext-encryption-service ./Release/AppRun
wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
chmod +x appimagetool-x86_64.AppImage

./appimagetool-x86_64.AppImage ./Release
mkdir Image
mv ./criptext-encryption-service-x86_64.AppImage ./Image/criptext-encryption-service
mv ./Release/AppRun ./Release/criptext-encryption-service