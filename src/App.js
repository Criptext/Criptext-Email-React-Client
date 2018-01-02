import React, { Component } from 'react';
import ThreadsList from './containers/ThreadsList';
import MailBox from './components/MailBox';
import SideBar from './components/SideBar';
import ActivityPanel from './components/ActivityPanel';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers/index';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './app.css'

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

const Inbox = MailBox(ThreadsList);

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
            <Route path="/" component={Inbox} />
            <ActivityPanel />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
