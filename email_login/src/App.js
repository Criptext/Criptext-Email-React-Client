import React, { Component } from 'react';
import LoginWrapper from './components/LoginWrapper';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers/index';
import './app.css';

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="main-container">
          <LoginWrapper />
        </div>
      </Provider>
    );
  }
}

export default App;
