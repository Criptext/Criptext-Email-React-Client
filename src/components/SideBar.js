import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';

const SideBar = props => (
  <aside className="navigation-app">
    <header>
      <div className="header-icon" />
    </header>
    <div className="navigation-partial-mail">
      <div className="nav-item-free">
        <button className="button button-compose">
          <i className="icon-edit" />
          <span>Compose</span>
        </button>
      </div>
      <nav>
        <ul>
          <li className="nav-item nav-item-selected">
            <div className="nav-item-icon">
              <i className="icon-mailbox" />
            </div>
            <Link to="/inbox">Inbox</Link>
          </li>
          <li className="nav-item">
            <div className="nav-item-icon">
              <i className="icon-sent" />
            </div>
            <Link to="/">Sent</Link>
            <div className="nav-notif">
              <span>+99</span>
            </div>
          </li>
          <li className="nav-item">
            <div className="nav-item-icon">
              <i className="icon-doc" />
            </div>
            <Link to="/">Draft</Link>
            <div className="nav-notif">
              <span>10</span>
            </div>
          </li>
          <li className="nav-item">
            <div className="nav-item-icon">
              <i className="icon-start" />
            </div>
            <Link to="/">Starred</Link>
          </li>
          <li className="nav-item">
            <div className="nav-item-icon">
              <i className="icon-not" />
            </div>
            <Link to="/">Spam</Link>
          </li>
          <li className="nav-item">
            <div className="nav-item-icon">
              <i className="icon-trash" />
            </div>
            <Link to="/">Trash</Link>
          </li>
          <li className="nav-item">
            <div className="nav-item-icon">
              <i className="icon-calendar" />
            </div>
            <Link to="/">Send Later</Link>
          </li>
          <li className="nav-item">
            <div className="nav-item-icon">
              <i className="icon-bell-inclined" />
            </div>
            <Link to="/">Reminders</Link>
            <div className="nav-notif">
              <span>3</span>
            </div>
          </li>
          <li className="nav-item nav-item-expand">
            <div className="nav-item-icon">
              <i className="icon-file" />
            </div>
            <Link to="/">Folders</Link>
          </li>
          <li className="nav-item nav-item-expand">
            <div className="nav-item-icon">
              <i className="icon-tag" />
            </div>
            <Link to="/">Labels</Link>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
);

export default SideBar;
