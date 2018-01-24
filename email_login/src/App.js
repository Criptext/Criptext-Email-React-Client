import React, { Component } from 'react';
import logo from './logo.svg';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
//import rootReducer from './reducers/index';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import './App.css';


//const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

class App extends Component {
  render() {
    return (
//      <Provider store={store}>
        <Router>
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Welcome to React</h1>
            </header>
            <p className="App-intro">
              To get started, edit <code>src/App.js</code> and save to reload.
            </p>
          </div>
        </Router>
//      </Provider>
    );
  }
}

export default App;
