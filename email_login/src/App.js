import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import './app.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="main-container">
          <Route exact path="/" component={Login} />
          <Route exact path="/signup" component={SignUp} />
        </div>
      </Router>
    );
  }
}

export default App;
