#!/bin/sh
has_error=0
projects="email_composer email_loading email_login email_mailbox"

echo "--------------------------------------------"
tput setaf 2;tput bold;
echo "             Packaging App";
tput sgr0;
echo "--------------------------------------------"

rm -rf ./src/app
mkdir -p ./src/app

for project in ${projects}; do
    echo "";
    echo "    $project:"

    # Check Project
    cd ./../$project > /dev/null;
    if [ $? -ne 0 ]; then
        tput setaf 1;tput setab 7;
        echo "      $project folder doesn't exists";
        has_error=1;
        break;
    fi

    # Yarn Install
    echo "     - Removing old dependencies..."
    rm -rf ../$project/node_modules;
    echo "     - Installing dependencies..."
    INSTALL_ERROR=$( { yarn install > /dev/null; } 2>&1 )
    if [ $? -ne 0 ]; then
        tput setaf 1;tput bold;
        echo "       Failed to install dependencies in $project"
        tput sgr0;
        echo "Reason:";
        tput setaf 1;tput setab 7;tput bold; echo $INSTALL_ERROR;
        has_error=1;
        break;
    fi

    # Yarn Build
    echo "     - Building..."
    BUILD_ERROR=$( { yarn build > /dev/null; } 2>&1 )
    if [ $? -ne 0 ]; then
        tput setaf 1;tput bold;
        echo "       Failed to build in $project";
        tput sgr0;
        echo "Reason:";
        tput setaf 1;tput setab 7;tput bold; echo $BUILD_ERROR;
        has_error=1;
        break;
    fi
    
    # Move to Eletron app folder
    echo "     - Preparing to package..."
    cd ./../electron_app
    mkdir -p ./src/app/$project
    cp -a ../$project/build/. ./src/app/$project/
    tput setaf 2;tput bold; echo "       Done"; tput sgr0;
    rm -rf ../$project/build
done

if [ $has_error -ne 1 ]; then
    echo "";
    echo "--------------------------------------------"
    tput setaf 2;tput bold;
    echo "       App packaged successfully!";
    tput sgr0;
    echo "--------------------------------------------"
fi
tput sgr0;