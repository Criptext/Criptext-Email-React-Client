import React, { Component } from 'react';
import TitleBar from './components/titleBar';
import PanelWrapper from './components/PanelWrapper';
import './electronapp.scss';

class ElectronApp extends Component {
  render() {
    return (
      <div className="main-container">
        <TitleBar />
        <PanelWrapper />
      </div>
    );
  }
}

export default ElectronApp;
