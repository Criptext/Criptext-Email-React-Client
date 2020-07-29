import React, { Component } from 'react';
import CustomTextField from '../templates/CustomTextField';
import { validateUsername, validateFullname, validatePassword, validateConfirmPassword} from '../../validators/validators'
import Button, { STYLE } from '../templates/Button';
import { checkAvailableUsername } from '../../utils/ipc.js';
import PropTypes from 'prop-types';

import './signupformwrapper.scss';

const INPUT = {
  USERNAME: 'signup-username',
  FULLNAME: 'signup-fullname',
  PASSWORD: 'signup-password',
  CONFIRM: 'signup-confirm-password'
}

class SignUpFormWrapper extends Component {
  constructor(props) {
    super(props);
    const initialData = props.signupData;
    this.state = {
      username: {
        value: initialData.username || '',
        error: null,
        valid: false
      },
      fullname: {
        value: initialData.fullname || '',
        error: null,
        valid: false
      },
      password: {
        value: initialData.password || '',
        error: null,
        visible: false,
        valid: false
      },
      confirmPassword: {
        value: initialData.password || '',
        error: null,
        visible: false,
        valid: false
      },
      enableButton: false
    };
  }

  render() {
    const {username, fullname, password, confirmPassword} = this.state;
    return (
      <div className="signup-form-wrapper">
        <div className="back-button" onClick={this.props.onGoBack}>
          <i className="icon-back" />
        </div>
        <div className="header-container">
          <h2>
            You're gonna love
            <br />
            Criptext!
          </h2>
          <div className="subtitle">
            <span>let's get you started</span>
          </div>
        </div>
        <div className="form-container">
          <CustomTextField
            id={INPUT.USERNAME}
            label="Username"
            type="text"
            value={username.value}
            error={!!username.error}
            helperText={username.error || ''}
            onChange={this.handleInputChange}
            InputProps={{
              endAdornment: <span>@criptext.com</span>
            }}
          />
          <CustomTextField 
            id={INPUT.FULLNAME}
            label="Fullname" 
            type="text" 
            value={fullname.value}
            error={!!fullname.error}
            helperText={fullname.error}
            onChange={this.handleInputChange}
          />
          <CustomTextField
            id={INPUT.PASSWORD}
            label="Password"
            type={this.state.password.visible ? 'text' : 'password'}
            value={password.value}
            error={!!password.error}
            helperText={password.error}
            onChange={this.handleInputChange}
            InputProps={{
              endAdornment: (
                <div>
                  <i
                    className={
                      this.state.password.visible
                        ? 'icon-show'
                        : 'icon-not-show'
                    }
                    onClick={this.showPassword}
                  />
                </div>
              )
            }}
          />
          <CustomTextField
            id={INPUT.CONFIRM}
            label="Confirm Password"
            type={this.state.confirmPassword.visible ? 'text' : 'password'}
            value={confirmPassword.value}
            error={!!confirmPassword.error}
            helperText={confirmPassword.error}
            onChange={this.handleInputChange}
            InputProps={{
              endAdornment: (
                <div>
                  <i
                    className={
                      this.state.confirmPassword.visible
                        ? 'icon-show'
                        : 'icon-not-show'
                    }
                    onClick={this.showConfirmPassword}
                  />
                </div>
              )
            }}
          />
        </div>
        <Button
          text={'Next'}
          onClick={this.handleNext}
          style={STYLE.CRIPTEXT}
          disabled={!this.state.enableButton}
        />
      </div>
    );
  }

  handleNext = () => {
    this.props.onGoTo('create', {
      username: this.state.username.value,
      fullname: this.state.fullname.value,
      password: this.state.password.value
    });
  };

  showPassword = () => {
    const newValue = !this.state.password.visible;
    this.setState({
      password: {
        ...this.state.password,
        visible: newValue
      }
    });
  };

  showConfirmPassword = () => {
    const newValue = !this.state.confirmPassword.visible;
    this.setState({
      confirmPassword: {
        ...this.state.confirmPassword,
        visible: newValue
      }
    });
  };

  handleInputChange = ev => {
    const newValue = ev.target.value;
    const targetId = ev.target.id;
    let key, newInputState, isValid;
    switch(targetId) {
      case INPUT.USERNAME:
        key = 'username';
        newInputState = { ...this.state.username };
        isValid = validateUsername(newValue);
        newInputState.error = isValid ? null : 'Username Error';
        if (isValid) {
          isValid = false;
          this.checkUsername(newValue);
        }
        break;
      case INPUT.FULLNAME:
        key = 'fullname';
        newInputState = { ...this.state.fullname };
        isValid = validateFullname(newValue);
        newInputState.error = isValid ? null : 'Fullname Error';
        break;
      case INPUT.PASSWORD:
        key = 'password';
        newInputState = { ...this.state.password };
        isValid = validatePassword(newValue);
        newInputState.error = isValid ? null : 'Passowrd Error';
        break;
      case INPUT.CONFIRM:
        key = 'confirmPassword';
        newInputState = { ...this.state.confirmPassword };
        isValid = validateConfirmPassword(this.state.password.value, newValue);
        newInputState.error = isValid ? null : 'Confirm Error';
        break;
      default: 
        break;
    }
    newInputState.valid = isValid;
    newInputState.value = newValue;
    this.setState({
      [key]: newInputState
    }, this.shouldEnableButton)
  }

  checkUsername = async username => {
    const { status } = await checkAvailableUsername(username);
    if (username !== this.state.username.value) return;
    switch(status) {
      case 200:
        this.setState({
          username: {
            ...this.state.username,
            valid: true
          }
        }, this.shouldEnableButton)
        break;
      default:
        this.setState({
          username: {
            ...this.state.username,
            error: 'Error Request'
          }
        }, this.shouldEnableButton)
        break;
    }
  }

  shouldEnableButton = () => {
    const shouldEnable =
      this.state.username.valid && this.state.password.valid && this.state.fullname.valid && this.state.confirmPassword.valid;
    if (shouldEnable !== this.state.enableButton) {
      this.setState({
        enableButton: shouldEnable
      });
    }
  };
}

export default SignUpFormWrapper;
