const errors = {
  UNABLE_TO_CONNECT: {
    status: 1,
    name: 'Unable to connect',
    description: 'Unable to connect to server'
  },
  NO_RESPONSE: {
    status: 2,
    name: 'No response',
    description: 'No response fromm server'
  },
  USER_ALREADY_EXISTS: {
    status: 3,
    name: 'User already exists',
    description: 'User already exists'
  },
  UNKNOWN_ERROR: {
    status: 4,
    name: 'Error',
    description: 'Unknown error'
  }
};

module.exports = errors;
