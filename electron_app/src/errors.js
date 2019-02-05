const { errorMessages } = require('./lang').strings;

const SERVER_ERROR = {
  UNABLE_TO_CONNECT: {
    name: errorMessages.UNABLE_TO_CONNECT.name,
    description: errorMessages.UNABLE_TO_CONNECT.description
  }
};

const MESSAGE_ERROR = {
  PRINTING_ERROR: {
    name: errorMessages.PRINTING_ERROR.name,
    description: errorMessages.PRINTING_ERROR.description
  },
  UNKNOWN: {
    name: errorMessages.UNKNOWN.name,
    description: errorMessages.UNKNOWN.description
  }
};

module.exports = {
  server: SERVER_ERROR,
  message: MESSAGE_ERROR
};
