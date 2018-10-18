const USER_ERROR = {
  ALREADY_EXISTS: {
    name: 'User already exists',
    description: 'User already exists. Try another username'
  }
};

const LOGIN_ERROR = {
  WRONG_CREDENTIALS: {
    name: 'Wrong credentials',
    description:
      'Incorrect username or password. Check credentials and try again.'
  },
  FAILED: {
    name: 'Login error',
    description: 'An error occurred while login. Please try again'
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
    description:
      "It seems that you're sending too many requests in a row.\n" +
      'Keep calm and try in a few moments again.'
  }
};

const SERVER_ERROR = {
  UNABLE_TO_CONNECT: {
    name: 'Unable to connect',
    description: 'Unable to connect to server'
  },
  NO_RESPONSE: {
    name: 'No response',
    description: 'No response from server'
  },
  UNAUTHORIZED: {
    name: 'Security error',
    description: "There's a security failure in your request"
  }
};

const MESSAGE_ERROR = {
  ENCRYPTING: {
    name: 'Encrypting error',
    description: 'An error occurred while encrypting message. Please try again'
  },
  NON_EXISTING_USERS: {
    name: 'Non existing users',
    description:
      "One or more users doesn't exists.\n" +
      'Check the recipients and try again'
  },
  UPLOAD_FAILED: {
    name: 'Upload Failed',
    description: 'An error occurred while uploading file.'
  },
  TOO_MANY_FILES: {
    name: 'Too many attachments',
    description: 'You can only attach 5 files to an email'
  },
  TOO_MANY_RECIPIENTS: {
    name: 'Too many recipients',
    description:
      'Oops! You can only send an email to 300 person.\n' +
      'Please verify your recipients and try again.'
  }
};

module.exports = {
  user: USER_ERROR,
  login: LOGIN_ERROR,
  server: SERVER_ERROR,
  message: MESSAGE_ERROR
};
