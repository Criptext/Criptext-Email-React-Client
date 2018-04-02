mkdir -p ./src/app

projects=( "email_composer" "email_dialog" "email_loading" "email_login" "email_mailbox")

for project in "${projects[@]}"
do
    cd ../$project
    yarn build
    cd ../electron_app 
    mkdir -p ./src/app/$project
    cp -a ../$project/build/. ./src/app/$project/
done