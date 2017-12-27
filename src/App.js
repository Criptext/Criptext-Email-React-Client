import React, { Component } from 'react';
import ThreadsList from './containers/ThreadsList';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers/index';
import { BrowserRouter as Router, Route } from 'react-router-dom';

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

window.getState = () => {
  return store.getState();
};

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <header className="App-header">
              <h1 className="App-title">Welcome to React</h1>
            </header>
            <Route path="/" component={ThreadsList} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
