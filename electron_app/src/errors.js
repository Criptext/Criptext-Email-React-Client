const errors = {
  UNABLE_TO_CONNECT: {
    name: 'Unable to connect',
    description: 'Unable to connect to server'
  },
  NO_RESPONSE: {
    name: 'No response',
    description: 'No response from server'
  },
  USER_ALREADY_EXISTS: {
    name: 'User already exists',
    description: 'User already exists. Try another username'
  },
  NON_EXISTING_USERS: {
    name: 'Non existing users',
    description: "One or more users doesn't exist. Check and try again"
  },
  ENCRYPTING_ERROR: {
    name: 'Encrypting error',
    description: 'An error occurred while encrypting message. Please try again'
  },
  UNKNOWN_ERROR: {
    name: 'Error',
    description: 'Unknown error'
  }
};

module.exports = errors;
