const { errorMessages } = require('./lang');

const USER_ERROR = {
  ALREADY_EXISTS: {
    name: errorMessages.ALREADY_EXISTS.name,
    description: errorMessages.ALREADY_EXISTS.description
  },
  PREKEYBUNDLE_FAILED: {
    name: errorMessages.PREKEYBUNDLE_FAILED.name,
    description: errorMessages.PREKEYBUNDLE_FAILED.description
  },
  CREATE_USER_FAILED: {
    name: errorMessages.CREATE_USER_FAILED.name,
    description: errorMessages.CREATE_USER_FAILED.description
  },
  SAVE_LOCAL: {
    name: errorMessages.SAVE_LOCAL.name,
    description: errorMessages.SAVE_LOCAL.description
  },
  SAVE_LABELS: {
    name: errorMessages.SAVE_LABELS.name,
    description: errorMessages.SAVE_LABELS.description
  },
  SAVE_OWN_CONTACT: {
    name: errorMessages.SAVE_OWN_CONTACT.name,
    description: errorMessages.SAVE_OWN_CONTACT.description
  },
  POST_KEYBUNDLE: {
    name: errorMessages.POST_KEYBUNDLE.name,
    description: errorMessages.POST_KEYBUNDLE.description
  },
  UPDATE_ACCOUNT_DATA: {
    name: errorMessages.UPDATE_ACCOUNT_DATA.name,
    description: errorMessages.UPDATE_ACCOUNT_DATA.description
  }
};

const LOGIN_ERROR = {
  WRONG_CREDENTIALS: {
    name: errorMessages.WRONG_CREDENTIALS.name,
    description: errorMessages.WRONG_CREDENTIALS.description
  },
  FAILED: {
    name: errorMessages.LOGIN_FAILED.name,
    description: errorMessages.LOGIN_FAILED.description
  },
  TOO_MANY_DEVICES: {
    name: errorMessages.TOO_MANY_DEVICES.name,
    description: errorMessages.TOO_MANY_DEVICES.description
  },
  TOO_MANY_REQUESTS: {
    name: errorMessages.TOO_MANY_REQUESTS.name,
    description: errorMessages.TOO_MANY_REQUESTS.description
  }
};

const SERVER_ERROR = {
  UNABLE_TO_CONNECT: {
    name: errorMessages.UNABLE_TO_CONNECT.name,
    description: errorMessages.UNABLE_TO_CONNECT.description
  },
  NO_RESPONSE: {
    name: errorMessages.NO_RESPONSE.name,
    description: errorMessages.NO_RESPONSE.description
  },
  UNAUTHORIZED: {
    name: errorMessages.UNAUTHORIZED.name,
    description: errorMessages.UNAUTHORIZED.description
  }
};

const MESSAGE_ERROR = {
  ENCRYPTING: {
    name: errorMessages.ENCRYPTING.name,
    description: errorMessages.ENCRYPTING.description
  },
  NON_EXISTING_USERS: {
    name: errorMessages.NON_EXISTING_USERS.name,
    description: errorMessages.NON_EXISTING_USERS.description
  },
  UPLOAD_FAILED: {
    name: errorMessages.UPLOAD_FAILED.name,
    description: errorMessages.UPLOAD_FAILED.description
  },
  TOO_MANY_FILES: {
    name: errorMessages.TOO_MANY_FILES.name,
    description: errorMessages.TOO_MANY_FILES.description
  },
  TOO_BIG_FILE: {
    name: errorMessages.TOO_BIG_FILE.name,
    description: errorMessages.TOO_BIG_FILE.description
  },
  TOO_MANY_RECIPIENTS: {
    name: errorMessages.TOO_MANY_RECIPIENTS.name,
    description: errorMessages.TOO_MANY_RECIPIENTS.description
  },
  UNKNOWN: {
    name: errorMessages.UNKNOWN.name,
    description: errorMessages.UNKNOWN.description
  }
};

const LINK_DEVICES_ERROR = {
  UPLOAD_DATA: {
    name: errorMessages.LINK_DEVICES_UPLOAD_DATA.name,
    description: errorMessages.LINK_DEVICES_UPLOAD_DATA.description
  }
};

module.exports = {
  user: USER_ERROR,
  login: LOGIN_ERROR,
  server: SERVER_ERROR,
  message: MESSAGE_ERROR,
  linkDevices: LINK_DEVICES_ERROR
};
