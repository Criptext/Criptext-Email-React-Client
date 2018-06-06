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
    description: "One or more users doesn't exist. Check and try again"
  },
  UPLOAD_FAILED: {
    name: 'Upload Failed',
    description: 'An error occurred while uploading file.'
  }
};

module.exports = {
  user: USER_ERROR,
  login: LOGIN_ERROR,
  server: SERVER_ERROR,
  message: MESSAGE_ERROR
};
