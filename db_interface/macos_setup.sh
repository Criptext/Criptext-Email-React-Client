if ! type "brew" > /dev/null; then
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi

brew install cmake

mkdir deps 
cd deps

git clone https://github.com/SRombauts/SQLiteCpp
cd SQLiteCpp
mkdir build 
cd build
cmake -DSQLITECPP_INTERNAL_SQLITE=ON -DSQLITECPP_BUILD_EXAMPLES=OFF -DSQLITECPP_BUILD_TESTS=OFF ..
cmake --build . && make install
ctest --output-on-failure
cd ..

cd ..
rm -rf deps