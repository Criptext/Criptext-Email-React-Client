import React, { Component } from 'react';
import TitleBar from './components/titleBar';
import { default as NewPanelWrapper } from './new-components/PanelWrapper';
import PanelWrapper from './components/PanelWrapper';
import './electronapp.scss';
import {
  getLoginInformation,
  setLoginInformation,
  mySettings
} from './utils/electronInterface';

const mode = {
  SIGNUP: 'SIGNUP',
  SIGNIN: 'SIGNIN',
  SIGNINTOAPPROVE: 'SIGNINTOAPPROVE',
  SIGNINPASSWORD: 'SIGNINPASSWORD',
  CHANGEPASSWORD: 'CHANGEPASSWORD',
  DEVICE_NOT_APPROVED: 'DEVICE_NOT_APPROVED'
};

const version = {
  NEW: 'new',
  OLD: 'old'
};

class ElectronApp extends Component {
  constructor() {
    super();
    this.state = {
      version: version.NEW,
      mode: mode.SIGNIN,
      signupError: undefined,
      theme: mySettings.theme || 'light'
    };
  }
  render() {
    return (
      <div
        className={`main-container ${
          this.state.version === version.NEW ? null : 'no-theme'
        }`}
        data-theme={
          this.state.version === version.NEW ? this.state.theme : null
        }
      >
        <TitleBar />
        {this.state.version === version.NEW ? (
          <NewPanelWrapper
            signupError={this.state.signupError}
            mode={this.state.mode}
            onChangeVersion={this.handleChangeVersion}
          />
        ) : (
          <PanelWrapper
            signupError={this.state.signupError}
            mode={this.state.mode}
            onChangeVersion={this.handleChangeVersion}
          />
        )}
      </div>
    );
  }

  componentWillMount() {
    const loginErrorInformation = getLoginInformation();
    if (Object.keys(loginErrorInformation).length > 0) {
      this.setState(
        {
          mode: mode.SIGNUP,
          signupError: loginErrorInformation
        },
        () => {
          setLoginInformation({});
        }
      );
    }
  }

  componentDidMount() {
    window.swapTheme = this.swapTheme;
  }

  handleChangeVersion = setVersion => {
    this.setState({
      version: setVersion
    });
  };

  swapTheme = theme => {
    this.setState({
      theme
    });
  };
}

export default ElectronApp;
