import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  validateUsername,
  validateFullname,
  validatePassword,
  validateConfirmPassword,
  validateEmail
} from './../validators/validators';
import SignUp from './SignUp';
import { hashPassword } from '../utils/HashUtils';

const toBeConfirmed = Symbol('toBeConfirmed');

const formItems = [
  {
    name: 'username',
    placeholder: 'Username',
    type: 'text',
    label: {
      text: '@criptext.com',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: 'Username not available',
    value: '',
    optional: false
  },
  {
    name: 'fullname',
    placeholder: 'Full name',
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: '',
    value: '',
    optional: false
  },
  {
    name: 'password',
    placeholder: 'Password',
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    errorMessage: '',
    value: '',
    optional: false
  },
  {
    name: 'confirmpassword',
    placeholder: 'Confirm password',
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-not-show',
    icon2: 'icon-show',
    errorMessage: 'Passwords do not match',
    value: '',
    optional: false
  },
  {
    name: 'recoveryemail',
    placeholder: 'Recovery email address (optional)',
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: 'Email invalid',
    value: '',
    optional: true
  },
  {
    name: 'acceptterms',
    placeholder: '',
    type: 'checkbox',
    label: {
      text: 'I have read and agree with the ',
      strong: 'Terms and Conditions'
    },
    icon: '',
    icon2: '',
    errorMessage: '',
    value: false,
    optional: false
  }
];

const errorMessages = {
  USERNAME_INVALID: 'Invalid username',
  USERNAME_EXISTS: 'username already exists',
  STATUS_UNKNOWN: 'Unknown status code: ',
  FULLNAME_INVALID: 'Invalid name',
  PASSWORD_INVALID: 'Invalid password',
  PASSWORD_NOMATCH: 'Passwords do not match',
  EMAIL_INVALID: 'Invalid email address'
};

const onInitState = (array, field) =>
  array.reduce((obj, item) => {
    // eslint-disable-next-line fp/no-mutation
    obj[item[field]] = item.value;
    return obj;
  }, {});

const onInitErrors = (array, field) =>
  array.reduce((obj, item) => {
    // eslint-disable-next-line fp/no-mutation
    obj[item[field]] = item.optional ? undefined : toBeConfirmed;
    return obj;
  }, {});

const isSignUpButtonDisabled = errors => {
  return Object.values(errors).some(errMsg => errMsg);
};

class SignUpWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: onInitState(formItems, 'name'),
      errors: onInitErrors(formItems, 'name'),
      isShowingPassword: false
    };
  }

  render() {
    return (
      <div>
        <SignUp
          {...this.props}
          values={this.state.values}
          items={formItems}
          onChangeField={this.handleChange}
          onClickSignUp={this.handleClickSignUp}
          errors={this.state.errors}
          disabled={isSignUpButtonDisabled(this.state.errors)}
          isShowingPassword={this.state.isShowingPassword}
          onToggleShowPassword={this.onToggleShowPassword}
        />
      </div>
    );
  }

  onToggleShowPassword = () =>
    this.setState(prevState => ({
      ...prevState,
      isShowingPassword: !prevState.isShowingPassword
    }));

  handleChange = (event, field) =>
    this.updateFormWithValidatedData(field, event.target.value);

  handleClickSignUp = event => {
    event.preventDefault();
    event.stopPropagation();
    const values = this.state.values;

    if (values.recoveryemail !== '') {
      this.onSubmit(values);
    } else {
      this.props.onSubmitWithoutRecoveryEmail(response => {
        if (response === 'Confirm') {
          this.onSubmit(values);
        }
      });
    }
  };

  onSubmit = values => {
    const username = values.username;
    const password = values.password;
    const hashedPassword = hashPassword(password);
    const submitValues = {
      username: username,
      password: hashedPassword,
      name: values.fullname,
      recoveryEmail: values.recoveryemail
    };
    this.props.onFormReady(submitValues);
  };

  handleCheckUsernameResponse = newUsername => ({ status }) => {
    this.setState(curState => {
      if (curState.values.username !== newUsername) return curState;
      console.log('status:', status);

      const { errors } = curState;

      switch (status) {
        case 200:
          return {
            errors: { ...errors, username: undefined }
          };
        case 422:
          return {
            errors: { ...errors, username: errorMessages.USERNAME_INVALID }
          };
        case 400:
          console.log('username:', errorMessages.USERNAME_EXISTS);
          return {
            errors: { ...errors, username: errorMessages.USERNAME_EXISTS }
          };
        default:
          return {
            errors: { ...errors, username: errorMessages.STATUS_UNKNOWN }
          };
      }
    });
  };

  withThrottling = fn => {
    if (this.lastUserCheck) clearTimeout(this.lastUserCheck);

    this.lastUserCheck = setTimeout(fn, 300);
  };

  checkUsername = username =>
    this.props
      .checkAvailableUsername(username)
      .then(this.handleCheckUsernameResponse(username))
      .catch(() => {
        this.setState(
          prevState =>
            prevState.values.username === username
              ? {
                  ...prevState,
                  errors: {
                    ...prevState.errors,
                    username: 'Unable to validate username'
                  }
                }
              : prevState
        );
      });

  updateFormWithValidatedData = (formItemName, formItemValue) =>
    this.setState(prevState => {
      const newState = {
        ...prevState,
        values: { ...prevState.values, [formItemName]: formItemValue },
        errors: { ...prevState.errors, [formItemName]: undefined }
      };
      switch (formItemName) {
        case 'username': {
          if (!validateUsername(formItemValue))
            return {
              ...newState,
              errors: { ...newState.errors, username: 'Invalid username' }
            };

          this.withThrottling(() => this.checkUsername(formItemValue));
          return {
            ...newState,
            errors: { ...newState.errors, username: toBeConfirmed }
          };
        }
        case 'fullname': {
          return validateFullname(formItemValue)
            ? newState
            : {
                ...newState,
                errors: {
                  ...newState.errors,
                  fullname: errorMessages.FULLNAME_INVALID
                }
              };
        }
        case 'password': {
          if (validatePassword(formItemValue)) {
            const { confirmpassword } = newState.values;
            if (confirmpassword === '')
              return {
                ...newState,
                errors: {
                  ...newState.errors,
                  confirmpassword: toBeConfirmed
                }
              };

            if (validateConfirmPassword(formItemValue, confirmpassword))
              return {
                ...newState,
                errors: {
                  ...newState.errors,
                  confirmpassword: undefined
                }
              };

            return newState;
          }
          return {
            ...newState,
            errors: {
              ...newState.errors,
              password: errorMessages.PASSWORD_INVALID
            }
          };
        }
        case 'confirmpassword': {
          const password = this.state.values['password'];
          return validateConfirmPassword(password, formItemValue)
            ? newState
            : {
                ...newState,
                errors: {
                  ...newState.errors,
                  confirmpassword: errorMessages.PASSWORD_NOMATCH
                }
              };
        }
        case 'recoveryemail': {
          return formItemValue === '' || validateEmail(formItemValue)
            ? newState
            : {
                ...newState,
                errors: {
                  ...newState.errors,
                  recoveryemail: errorMessages.EMAIL_INVALID
                }
              };
        }
        default:
          return newState;
      }
    });
}

// eslint-disable-next-line fp/no-mutation
SignUpWrapper.propTypes = {
  checkAvailableUsername: PropTypes.func.isRequired,
  onFormReady: PropTypes.func,
  onSubmitWithoutRecoveryEmail: PropTypes.func
};

export default SignUpWrapper;
