import React, { Component } from 'react';
import TitleBar from './components/titleBar';
import LoginWrapper from './components/LoginWrapper';
import './electronapp.scss';

class ElectronApp extends Component {
  render() {
    return (
      <div className="main-container">
        <TitleBar />
        <LoginWrapper />
      </div>
    );
  }
}

export default ElectronApp;
