import React from 'react';
import { closeLoginWindow, minimizeLoginWindow } from './../utils/ipc';
import './titleBar.scss';
import { version } from './../../package.json';

const isWindows = () => {
  const platform = window.navigator.platform;
  return platform.indexOf('Win') > -1;
};

const titleBar = () => (
  <div
    className={`title-bar ${
      isWindows() ? 'placement-right' : 'placement-left'
    }`}
  >
    <span className="buttons">
      <span className="minimize" onClick={minimizeLoginWindow}>
        <i className="icon-minimize" />
      </span>
      <span className="close" onClick={() => closeLoginWindow({})}>
        <i className="icon-exit" />
      </span>
    </span>
  </div>
);

export default titleBar;
