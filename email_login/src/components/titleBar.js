import React from 'react';
import {
  closeLogin,
  minimizeLogin,
  isWindows
} from './../utils/electronInterface';
import './titleBar.scss';

const titleBar = () => (
  <div
    className={`title-bar ${
      isWindows() ? 'placement-right' : 'placement-left'
    }`}
  >
    <span className="buttons">
      <span className="minimize" onClick={minimizeLogin}>
        <i className="icon-minimize" />
      </span>
      <span className="close" onClick={closeLogin}>
        <i className="icon-exit" />
      </span>
    </span>
  </div>
);

export default titleBar;
