# Criptext Email React Client

Finally, an email service that's built around your privacy. Get your @criptext.com email address and see what it's like to have peace of mind and privacy in every email you send.

## Features

- End-to-end Encryption: Criptext uses the open source Signal Protocol library to encrypt your emails. Your emails are locked with a unique key that‘s generated and stored on your device alone, which means only you and your intended recipient can read the emails you send.
- No data collection: unlike every other email service out there, Criptext doesn't store your emails in its servers. Instead, your entire inbox is stored exclusively on your device.
- Easy to use: our app is designed to work as simple as any other email app — so much so, you'll forget how secure it is.

## Contributing Bug reports

We use GitHub for bug tracking. Please search the existing issues for your bug and create a new one if the issue is not yet tracked!
[https://github.com/Criptext/Criptext-Email-React-Client/issues](https://github.com/Criptext/Criptext-Email-React-Client/issues)

## Contributing Translations

<a href="https://lokalise.co/" target="_blank"><img src="https://lokalise.co/img/lokalise_logo_black.png" width="120px"/></a>

We use Lokalise for translations. If you are interested in helping please write us at <a href="mailto:support@criptext.com">support@criptext.com</a>

## Dependencies

To build Criptext on your machine you'll need:

* Node.js (Recommended 12.12+) 
* Yarn (Recommended 1.19.1+) 

## Run locally

Clone this repository and run a few scripts:

``` bash
git clone https://github.com/Criptext/Criptext-Email-React-Client
cd Criptext-Email-React-Client
node install.js # Install dependenciess
```

To up all projects, got to each project and run:
``` bash
yarn start # Run locally
```
First up the projects like `email_*` and last `electrop_app`

On all directories, like `email_*` it is recommended to have a .env file 
with the following content:

```
PORT=####
SKIP_PREFLIGHT_CHECK=true
REACT_APP_APPDOMAIN=criptext.com
REACT_APP_AVATAR_URL=https://api.criptext.com/user/avatar/
```

The project `electrop_app` the .env file should have this:
```
NODE_ENV=development
MAILBOX_URL=http://localhost:####
LOGIN_URL=http://localhost:####
LOADING_URL=http://localhost:####
COMPOSER_URL=http://localhost:####
DEV_SOCKET_URL=wss://socket.criptext.com
DEV_SERVER_URL=https://api.criptext.com
DEV_DATA_TRANSFER_URL=https://transfer.criptext.com
CSC_IDENTITY_AUTO_DISCOVERY=true
DEV_APP_DOMAIN=criptext.com
```


## Contributing Code

Contributions are welcome. This project contains subdirectories according to each module of the app:
* electron_app: contains the files needed to run electron and load the app views
* email_mailbox: contains the main view of the app which is made-up of the mailbox itself, settings, contacts, etc.
* email_composer: contains the view and code that handles the window that edits new emails.
* email_login: contains the views and code that handles user sign in and sign up.
* email_loading: contains the views and code that handles spinners and progress bars between window transitions.


The main application logic is the `electron_app` dir. 
Before submitting any patches to the main application run the linter and tests:

``` bash
yarn lint        # Run the linter
yarn test        # Run unit tests
yarn integration # Run integrations
```

The other directories are React Apps built with [create-react-app](
https://github.com/facebook/create-react-app) used as the UI of the main 
application. Please note that they won't work on the browser because they 
require electron APIs. Once again, before submitting any patches run the linter 
and tests:

``` bash
yarn lint 
yarn test 
```

## Support

For troubleshooting and questions, please write us at <a href="mailto:support@criptext.com">support@criptext.com</a>

## License 

Copyright 2018 Criptext Inc.

Licensed under the GPLv2: http://www.gnu.org/licenses/gpl-2.0.html
