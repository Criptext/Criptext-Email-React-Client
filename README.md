# Criptext Email React Client

Finally, an email service that's built around your privacy. Get your @criptext.com email address and see what it's like to have peace of mind and privacy in every email you send.

## Features

- End-to-end Encryption: Criptext uses the open source Signal Protocol library to encrypt your emails. Your emails are locked with a unique key that‘s generated and stored on your device alone, which means only you and your intended recipient can read the emails you send.
- No data collection: unlike every other email service out there, Criptext doesn't store your emails in its servers. Instead, your entire inbox is stored exclusively on your device.
- Easy to use: our app is designed to work as simple as any other email app — so much so, you'll forget how secure it is.

## Contributing Bug reports

We use GitHub for bug tracking. Please search the existing issues for your bug and create a new one if the issue is not yet tracked!

## Dependencies

To build Criptext on your machine you'll need:

* Node.js (Recommended 8.12+) 
* Yarn

## Run locally

Clone this repository and run a few scripts:

``` bash
git clone https://github.com/Criptext/Criptext-Email-React-Client
cd Criptext-Email-React-Client
node install.js # install dependencies
node start.js # Run locally
```

On some directories, like `email_login` it is recommended to have a .env file 
with the following content:

```
SKIP_PREFLIGHT_CHECK=true
```
## Contributing Code

Contributions are welcome. This project contains subdirectories according to each module of the app:
* electron_app: contains the files needed to run electron and load the app views
* email_mailbox: contains the main view of the app which is made-up of the mailbox itself, settings, contacts, etc.
* email_composer: contains the view and code that handles the window that edits new emails.
* email_login: contains the views and code that handles user sign in and sign up.
* email_dialog: contains various dialogs that pop up in the app.
* email_loading: contains the views and code that handles spinners and progress bars between window transitions.


The main application logic is the `electron_app` dir. 
Before submitting any patches to the main application run the linter and tests:

``` bash
yarn lint # Run the linter
yarn test # Run unit tests
yarn integration # Run integrations
```

The other directories are React Apps built with [create-react-app](
https://github.com/facebook/create-react-app) used as the UI of the main 
application. Please note that they won't work on the browser because they 
require electron APIs. Once again, Before submitting any patches run the linter 
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
