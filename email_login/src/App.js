import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
//import rootReducer from './reducers/index';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import Login from './components/Login'


//const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

class App extends Component {
  render() {
    return (
//      <Provider store={store}>
        <Router>
          <Login />
        </Router>
//      </Provider>
    );
  }
}

export default App;
