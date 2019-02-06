import { toBeConfirmed, optionallyEmpty } from './SignUpSymbols';
import * as ErrorMsgs from './SignUpErrorMsgs';
import {
  validateSignupUsername,
  validateFullname,
  validatePassword,
  validateConfirmPassword,
  validateEmail
} from './../validators/validators';

export const checkUsername = (state, { newUsername, status }) => {
  if (state.values.username !== newUsername) return state;

  const { errors } = state;

  switch (status) {
    case 200:
      return {
        errors: { ...errors, username: undefined }
      };
    case 422:
      return {
        errors: { ...errors, username: ErrorMsgs.USERNAME_INVALID }
      };
    case 400:
    case 410:
      return {
        errors: { ...errors, username: ErrorMsgs.USERNAME_EXISTS }
      };
    default:
      return {
        errors: { ...errors, username: ErrorMsgs.STATUS_UNKNOWN + status }
      };
  }
};

export const handleCheckUsernameIOError = (state, { newUsername }) => {
  return state.values.username === newUsername
    ? {
        ...state,
        values: {
          ...state.values,
          username: ''
        },
        errors: {
          ...state.errors,
          username: ErrorMsgs.USERNAME_UNCERTAIN
        }
      }
    : state;
};

export const updateForm = (state, { itemName, itemValue }) => {
  const newState = {
    ...state,
    values: { ...state.values, [itemName]: itemValue },
    errors: { ...state.errors, [itemName]: undefined }
  };
  switch (itemName) {
    case 'username': {
      if (!validateSignupUsername(itemValue))
        return {
          ...newState,
          errors: { ...newState.errors, username: ErrorMsgs.USERNAME_INVALID }
        };

      return {
        ...newState,
        errors: { ...newState.errors, username: toBeConfirmed }
      };
    }
    case 'fullname': {
      return validateFullname(itemValue)
        ? newState
        : {
            ...newState,
            errors: {
              ...newState.errors,
              fullname: ErrorMsgs.FULLNAME_INVALID
            }
          };
    }
    case 'password': {
      if (validatePassword(itemValue)) {
        const { confirmpassword } = newState.values;
        // password is ok, but we must check if it matches the 2nd field
        return updateForm(newState, {
          itemName: 'confirmpassword',
          itemValue: confirmpassword
        });
      }
      return {
        ...newState,
        errors: {
          ...newState.errors,
          password: ErrorMsgs.PASSWORD_INVALID
        }
      };
    }
    case 'confirmpassword': {
      if (itemValue === '')
        return {
          ...newState,
          errors: {
            ...newState.errors,
            confirmpassword: toBeConfirmed
          }
        };

      const { password } = state.values;
      return validateConfirmPassword(password, itemValue)
        ? newState
        : {
            ...newState,
            errors: {
              ...newState.errors,
              confirmpassword: ErrorMsgs.PASSWORD_NOMATCH
            }
          };
    }
    case 'recoveryemail': {
      if (itemValue === '')
        return {
          ...newState,
          errors: {
            ...newState.errors,
            recoveryemail: optionallyEmpty
          }
        };

      return validateEmail(itemValue)
        ? newState
        : {
            ...newState,
            errors: {
              ...newState.errors,
              recoveryemail: ErrorMsgs.EMAIL_INVALID
            }
          };
    }
    default:
      return newState;
  }
};
