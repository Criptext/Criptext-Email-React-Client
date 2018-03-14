import React from 'react';
import { closeLogin, minimizeLogin } from './../utils/electronInterface';
import './titleBar.css';

const titleBar = () => (
  <div className="title-bar">
    <span className="buttons">
      <span className="close" onClick={ev => closeLogin(ev)} />
      <span className="minimize" onClick={ev => minimizeLogin(ev)} />
      <span className="bar-clear" />
    </span>
  </div>
);

export default titleBar;
