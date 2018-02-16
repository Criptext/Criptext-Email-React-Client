import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';
import ContinueLogin from './ContinueLogin';
import { closeLogin, openMailbox } from './../utils/electronInterface';

const checkRequired = field => {
  return field !== undefined;
};
const checkminLength = (field, length) => {
  return field.length > length;
};

class LoginWrapper extends Component {
  constructor() {
    super();
    this.state = {
      showSignUp: false,
      showContinue: false,
      values: {
        username: ''
      },
      disabled: true
    };
    this.validators = {
      username: () => this.validateUsername()
    };
  }

  componentDidMount() {
    this.checkDisable();
  }

  render() {
    if (this.state.showSignUp) {
      return <SignUpWrapper toggleSignUp={ev => this.toggleSignUp(ev)} />;
    }
    if (this.state.showContinue) {
      return <ContinueLogin toggleContinue={ev => this.toggleContinue(ev)} />;
    }
    return (
      <Login
        toggleSignUp={ev => this.toggleSignUp(ev)}
        handleSubmit={this.handleSubmit}
        onChangeField={this.handleChange}
        disabled={this.state.disabled}
        validator={this.validators.username}
      />
    );
  }

  toggleSignUp = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      showSignUp: !this.state.showSignUp,
      showContinue: false
    });
  };

  toggleContinue = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      showSignUp: false,
      showContinue: !this.state.showContinue
    });
  };

  validateUsername = () => {
    const username = this.state.values['username'];
    return checkRequired(username) && checkminLength(username, 2);
  };

  checkDisable = () => {
    const isValid = this.validators['username']();
    this.setState({
      disabled: !isValid
    });
  };

  handleChange = event => {
    const newState = this.state;
    newState.values[event.target.name] = event.target.value;
    this.setState(newState);
    this.checkDisable();
  };

  handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      showSignUp: false,
      showContinue: true
    });
    setTimeout(() => {
      openMailbox();
      closeLogin();
    }, 8000);
  };
}

export default LoginWrapper;
