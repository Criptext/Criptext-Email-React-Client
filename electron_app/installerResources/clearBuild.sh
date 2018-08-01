#!/bin/bash

projects=("email_composer" "email_dialog" "email_loading" "email_login" "email_mailbox")

for project in ${projects[*]}
do
    rm -rf ./../$project/build
done

rm -rf ./src/app
rm -rf ./dist
rm -rf ./release-builds
