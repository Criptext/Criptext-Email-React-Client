# Criptext Email React Client

Source code for the Criptext email client for desktop developed with Electron and React.

The project contains subdirectories according to each module of the app:
* electron_app: contains the files needed to run electron and load the app views
* email_mailbox: contains the main view of the app which is made-up of the mailbox itself, settings, contacts, etc.
* email_composer: contains the view and code that handles the window that edits new emails.
* email_login: contains the views and code that handles user sign in and sign up.
* email_loader: contains the views and code that handles spinners and progress bars between window transitions.

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

## Contributing

Contributions are welcome. The main application logic is the `electron_app` dir. 
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
