import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SignUp from './SignUp';
import ErrorMsgs from './SignUpErrorMsgs';
import { hashPassword } from '../utils/HashUtils';
import { toBeConfirmed } from './SignUpSymbols';
import { formItems, createStore } from './SignUpStore';
import reducers from './SignUpReducers';

const isSignUpButtonDisabled = errors => {
  return Object.values(errors).some(errMsg => errMsg);
};

class SignUpWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = createStore();
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
    this.onSubmit(values);
  };

  onSubmit = values => {
    const { password, username } = values;
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

      const { errors } = curState;

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
          return {
            errors: { ...errors, username: ErrorMsgs.USERNAME_EXISTS }
          };
        default:
          return {
            errors: { ...errors, username: ErrorMsgs.STATUS_UNKNOWN }
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

  updateFormWithValidatedData = (itemName, itemValue) =>
    this.setState(prevState => {
      const newState = reducers.updateForm(prevState, { itemName, itemValue });

      if (itemName === 'username' && newState.errors.username === toBeConfirmed)
        // side effect check username over network
        this.withThrottling(() => this.checkUsername(itemValue));
    });
}

// eslint-disable-next-line fp/no-mutation
SignUpWrapper.propTypes = {
  checkAvailableUsername: PropTypes.func.isRequired,
  onFormReady: PropTypes.func
};

export default SignUpWrapper;
