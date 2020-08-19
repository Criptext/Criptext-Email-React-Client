import React, { Component } from 'react';
import TitleBar from './components/titleBar';
import PanelWrapper from './new-components/PanelWrapper';
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

class ElectronApp extends Component {
  constructor() {
    super();
    this.state = {
      mode: mode.SIGNIN,
      signupError: undefined,
      theme: mySettings.theme || 'light'
    };
  }
  render() {
    return (
      <div className="main-container" data-theme={this.state.theme}>
        <TitleBar />
        <PanelWrapper
          signupError={this.state.signupError}
          mode={this.state.mode}
        />
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

  swapTheme = theme => {
    this.setState({
      theme
    });
  };
}

export default ElectronApp;
