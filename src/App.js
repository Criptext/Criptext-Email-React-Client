import React, { Component } from 'react';
import ThreadsList from './containers/ThreadsList';
import SideBar from './components/SideBar';
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
          <div className="wrapper">
            <SideBar />
            <Route path="/" component={ThreadsList} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
