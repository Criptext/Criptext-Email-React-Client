import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

jest.mock('./components/ThreadsList.js', () => () => (
  <div>ThreadsList Component</div>
));

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
