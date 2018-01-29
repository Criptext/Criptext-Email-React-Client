import React, { Component } from 'react';
import Login from './components/Login';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="main-container">
        <Login />
      </div>
    );
  }
}

export default App;
