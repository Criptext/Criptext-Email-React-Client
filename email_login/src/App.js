import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './components/Login';
import './app.css';

class App extends Component {
  render() {
    return (
      <Router>
        <Login />
      </Router>
    );
  }
}

export default App;
