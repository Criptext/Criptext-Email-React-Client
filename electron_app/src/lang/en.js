module.exports = {
  errorMessages: {
    ALREADY_EXISTS: {
      name: 'User already exists',
      description: 'User already exists. Try another username'
    },
    PREKEYBUNDLE_FAILED: {
      name: 'Error creating account',
      description: 'Failed to generate prekeybundle'
    },
    CREATE_USER_FAILED: {
      name: 'Error creating user',
      description: 'Failed to create user.\nCode: '
    },
    SAVE_LOCAL: {
      name: 'Error creating account',
      description: 'Failed to create user in local database'
    },
    SAVE_LABELS: {
      name: 'Error creating account',
      description: 'Failed to create labels in local database'
    },
    SAVE_OWN_CONTACT: {
      name: 'Error creating account',
      description: 'Failed to save own contact in local database'
    },
    POST_KEYBUNDLE: {
      name: 'Error creating account',
      description: 'Failed to post keybundle.\nCode: '
    },
    UPDATE_ACCOUNT_DATA: {
      name: 'Error creating account',
      description: 'Failed to update account data'
    },
    WRONG_CREDENTIALS: {
      name: 'Wrong credentials',
      description:
        'Incorrect username or password. Check credentials and try again.'
    },
    LOGIN_FAILED: {
      name: 'Login error',
      description: 'An error occurred while login. Please try again.\nCode: '
    },
    TOO_MANY_DEVICES: {
      name: 'Too many devices',
      description:
        'You already have too many active devices. \n' +
        'From one of your trusted devices remove some inactive device and try again. ' +
        "If you can't access any of your trusted devices, contact support"
    },
    TOO_MANY_REQUESTS: {
      name: 'Too many requests',
      description: 'Too many consecutive attempts.\n' + 'Please try again in '
    },
    UNABLE_TO_CONNECT: {
      name: 'Unable to connect',
      description: 'Unable to connect to server'
    },
    NO_RESPONSE: {
      name: 'No response',
      description: 'No response from server'
    },
    UNAUTHORIZED: {
      name: 'Encrypting error',
      description: 'An error occurred in your request.\nPlease try again'
    },
    ENCRYPTING: {
      name: 'Encrypting error',
      description: 'An error occurred while encrypting message.\nCode: '
    },
    NON_EXISTING_USERS: {
      name: 'Non existing users',
      description:
        "One or more users doesn't exists.\n" +
        'Check the recipients and try again'
    },
    UPLOAD_FAILED: {
      name: 'Upload failed',
      description: 'An error occurred while uploading file.\nPlease try again'
    },
    TOO_MANY_FILES: {
      name: 'Too many attachments',
      description: 'You can only attach 5 files to an email'
    },
    TOO_BIG_FILE: {
      name: 'Too big file',
      description: {
        prefix: 'The file',
        suffix: 'exceeds',
        defaultEnd: 'allowed size'
      }
    },
    PENDING_FILES: {
      name: 'Pending files',
      description:
        'You have uploading or failed files. Please check your files and try again'
    },
    TOO_MANY_RECIPIENTS: {
      name: 'Too many recipients',
      description:
        'Your emails can only contain until 300 recipients.\n' +
        'Please verify and try again.'
    },
    UNKNOWN: {
      name: 'Error',
      description:
        'An error occurred while processing your request.\n' + 'Code: '
    },
    LINK_DEVICES_UPLOAD_DATA: {
      name: 'Link device error',
      description: 'Failed to upload data.\nCode: '
    }
  },
  updaterMessages: {
    error: {
      name: 'Updater Error',
      description:
        'An error occurred while downloading the update.\n' + 'Try again later'
    },
    unknownError: 'Unknown',
    notAvailable: {
      name: 'No Update Available',
      description: "You're on the latest version of Criptext"
    },
    availableManual: {
      name: 'Update Available',
      description:
        'A new version of Criptext is available. Would you like to download it now?',
      confirmButton: 'Yes',
      cancelButton: 'No'
    },
    availableAuto: {
      title: 'A new version of Criptext is available!',
      subtitle: 'Click here to download or dismiss to update later'
    },
    downloading: {
      title: 'Downloading update',
      subtitle: "When it's ready we will notify you"
    },
    alreadyDownloading: {
      title: 'Downloading update',
      subtitle: 'An update is currently being downloaded'
    },
    downloaded: {
      title: 'Install Update',
      subtitle:
        'Update download complete. Criptext will restart and update immediately'
    }
  }
};
