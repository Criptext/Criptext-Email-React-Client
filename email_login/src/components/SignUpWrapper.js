import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SignUp from './SignUp';
import { hashPassword } from '../utils/HashUtils';
import { toBeConfirmed } from './SignUpSymbols';
import { formItems, createStore } from './SignUpStore';
import * as reducers from './SignUpReducers';
import * as model from './SignUpModel';

class SignUpWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = createStore();
  }

  render() {
    return (
      <SignUp
        {...this.props}
        values={this.state.values}
        items={formItems}
        onChangeField={this.handleChange}
        onClickSignUp={this.handleClickSignUp}
        errors={this.state.errors}
        disabled={model.shouldDisableSubmitButton(this.state)}
        isShowingPassword={this.state.isShowingPassword}
        onToggleShowPassword={this.onToggleShowPassword}
      />
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
    this.setState(curState =>
      reducers.checkUsername(curState, { newUsername, status })
    );
  };

  withThrottling = fn => {
    if (this.lastUserCheck) clearTimeout(this.lastUserCheck);
    this.lastUserCheck = setTimeout(fn, 300);
  };

  checkUsername = newUsername =>
    this.props
      .checkAvailableUsername(newUsername)
      .then(this.handleCheckUsernameResponse(newUsername))
      .catch(() => {
        this.setState(prevState =>
          reducers.handleCheckUsernameIOError(prevState, { newUsername })
        );
      });

  updateFormWithValidatedData = (itemName, itemValue) =>
    this.setState(prevState => {
      const newState = reducers.updateForm(prevState, { itemName, itemValue });

      if (itemName === 'username' && newState.errors.username === toBeConfirmed)
        // side effect check username over network
        this.withThrottling(() => this.checkUsername(itemValue));

      return newState;
    });
}

// eslint-disable-next-line fp/no-mutation
SignUpWrapper.propTypes = {
  checkAvailableUsername: PropTypes.func.isRequired,
  onFormReady: PropTypes.func
};

export default SignUpWrapper;
