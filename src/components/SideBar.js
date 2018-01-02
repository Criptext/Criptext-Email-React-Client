import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';

const SideBar = props => (
  <aside className="navigation-app">
    <header>
      <div className="header-icon" />
    </header>
    <div className="nav-item-free">
      <button className="button button-compose">Compose</button>
    </div>
    <nav>
      <ul>
        <li className="nav-item nav-item-selected">
          <div className="nav-item-icon" />
          <Link to="/inbox">Inbox</Link>
        </li>
        <li className="nav-item">
          <div className="nav-item-icon" />
          <Link to="/">Sent</Link>
          <div className="nav-notif">
            <span>+99</span>
          </div>
        </li>
        <li className="nav-item">
          <div className="nav-item-icon" />
          <Link to="/">Draft</Link>
        </li>
        <li className="nav-item">
          <div className="nav-item-icon" />
          <Link to="/">Starred</Link>
        </li>
        <li className="nav-item">
          <div className="nav-item-icon" />
          <Link to="/">Spam</Link>
        </li>
        <li className="nav-item">
          <div className="nav-item-icon" />
          <Link to="/">Trash</Link>
        </li>
        <li className="nav-item">
          <div className="nav-item-icon" />
          <Link to="/">Send Later</Link>
        </li>
        <li className="nav-item nav-item-expand">
          <div className="nav-item-icon" />
          <Link to="/">Folders</Link>
        </li>
        <li className="nav-item nav-item-expand">
          <div className="nav-item-icon" />
          <Link to="/">Labels</Link>
        </li>
      </ul>
    </nav>
  </aside>
);

export default SideBar;
