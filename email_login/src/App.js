import React, { Component } from 'react';
import TitleBar from './components/titleBar';
import LoginWrapper from './components/LoginWrapper';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="main-container">
        <TitleBar />
        <LoginWrapper />
      </div>
    );
  }
}

export default App;
