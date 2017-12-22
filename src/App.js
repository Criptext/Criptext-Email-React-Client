import React, { Component } from 'react';
import ThreadsList from './components/ThreadsList';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <ThreadsList />
      </div>
    );
  }
}

export default App;
