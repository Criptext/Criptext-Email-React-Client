import React, { Component } from 'react';
import LoginWrapper from './components/LoginWrapper';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="main-container">
        <LoginWrapper />
      </div>
    );
  }
}

export default App;
