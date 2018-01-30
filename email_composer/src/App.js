import React, { Component } from 'react';
import Recipient from './components/RecipientWrapper';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="wrapper">
        <Recipient />
      </div>
    );
  }
}

export default App;
