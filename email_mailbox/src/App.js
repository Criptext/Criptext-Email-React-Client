import React, { Component } from 'react';
import MainContainer from './containers/MainContainer';
import SideBar from './containers/SideBar';
import ActivityPanel from './containers/ActivityPanel';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers/index';
import './app.css';

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

window.getState = () => {
  return store.getState();
};

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="wrapper-out">
          <div className="wrapper-in">
            <SideBar />
            <div className="main-container">
              <MainContainer />
            </div>
            <ActivityPanel />
          </div>
        </div>
      </Provider>
    );
  }
}

export default App;
