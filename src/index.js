import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import registerServiceWorker from './registerServiceWorker';
import rootReducer from './reducers/index';
import {  BrowserRouter as Router, Route } from 'react-router-dom' 

const store = createStore(rootReducer)

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route path='/' component={App} />
    </Router>
  </Provider>, 
document.getElementById('root'));

registerServiceWorker();
