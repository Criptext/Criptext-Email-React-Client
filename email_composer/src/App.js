import React, { Component } from 'react';
import Recipient from './components/RecipientWrapper';
import Subject from './components/Subject';
import Body from './components/Body';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="wrapper">
        <Recipient />
        <Subject />
        <Body />
      </div>
    );
  }
}

export default App;
