import {
  closeLogin,
  openCreateKeys,
  openMailbox
} from '../utils/electronInterface';

export const loginUser = user => {
  return async () => {
    try {
      const userCredentials = {
        username: user.username,
        password: user.password,
        deviceId: 1
      };
      const serverResponse = { status: 200, text: '', userCredentials }
      const responseStatus = serverResponse.status;
      if (responseStatus === 200) {
        openMailbox();
        closeLogin();
      } else {
        alert(serverResponse.text);
      }
    } catch (e) {
      // To do
    }
  };
};

export const signUpUser = user => {
  openCreateKeys(user);
  //closeLogin();
};