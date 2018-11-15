import React, { Component } from 'react';
import Panel from './containers/Panel';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers/index';
import CustomTitleBar from './components/CustomTitleBar';
import './app.scss';

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

window.getState = () => {
  return store.getState();
};

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="wrapper-out">
          <CustomTitleBar />
          <Panel />
        </div>
      </Provider>
    );
  }
}

export default App;
