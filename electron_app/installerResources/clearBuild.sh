#!/bin/sh

projects="email_composer email_dialog email_loading email_login email_mailbox"

for project in ${projects}; do
    # Remove previous builds in projects
    rm -rf ./../$project/build
done

# Remove build folders in electron_app
rm -rf ./src/app
rm -rf ./dist
rm -rf ./release-builds
