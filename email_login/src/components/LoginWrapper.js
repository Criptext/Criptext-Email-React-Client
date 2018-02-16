import React, { Component } from 'react';
import Login from './Login';
import SignUpWrapper from './SignUpWrapper';

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
    this.setState({ showSignUp: !this.state.showSignUp });
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
  };
}

export default LoginWrapper;
