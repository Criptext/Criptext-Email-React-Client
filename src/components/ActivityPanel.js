import React from 'react';
import { Link } from 'react-router-dom';
import './activitypanel.css';

const ActivityPanel = props => (
  <aside className="navigation-feed">
    <header>
      <div className="header-content">
        <div className="header-title"> ACTIVITY FEED </div>
        <div className="header-button" />
      </div>
    </header>

    <nav>
      <ul className="new-feeds">
        <li className="feed-section-title">
          <p className="text"> NEW </p>
        </li>
        <li className="feed-item">
          <div className="feed-content">
            <div className="feed-name"> Schedule email sent </div>
            <span className="feed-subject"> Why we all should flate text </span>
            <span className="feed-time">
              {' '}
              <small>3:59 PM</small>{' '}
            </span>
            <span className="feed-clear" />
          </div>
        </li>
        <li className="feed-item">
          <div className="feed-content">
            <div className="feed-name"> Email expired </div>
            <span className="feed-subject"> Re: Last Meeting </span>
            <span className="feed-time">
              {' '}
              <small>3:59 PM</small>{' '}
            </span>
            <span className="feed-clear" />
          </div>
        </li>
        <li className="feed-item">
          <div className="feed-content">
            <div className="feed-name"> Daniel Tigse Palma opened </div>
            <span className="feed-subject"> Re: Last Meeting </span>
            <span className="feed-time">
              {' '}
              <small>3:59 PM</small>{' '}
            </span>
            <span className="feed-clear" />
          </div>
        </li>
      </ul>

      <ul className="new-feeds">
        <li className="feed-section-title">
          <p className="text"> OLDER </p>
        </li>
        <li className="feed-item">
          <div className="feed-content">
            <div className="feed-name"> Schedule email sent </div>
            <span className="feed-subject"> Why we all should flate text </span>
            <span className="feed-time">
              {' '}
              <small>3:59 PM</small>{' '}
            </span>
            <span className="feed-clear" />
          </div>
        </li>
        <li className="feed-item">
          <div className="feed-content">
            <div className="feed-name"> Email expired </div>
            <span className="feed-subject"> Re: Last Meeting </span>
            <span className="feed-time">
              {' '}
              <small>3:59 PM</small>{' '}
            </span>
            <span className="feed-clear" />
          </div>
        </li>
        <li className="feed-item">
          <div className="feed-content">
            <div className="feed-name"> Daniel Tigse Palma opened </div>
            <span className="feed-subject"> Re: Last Meeting </span>
            <span className="feed-time">
              {' '}
              <small>3:59 PM</small>{' '}
            </span>
            <span className="feed-clear" />
          </div>
        </li>
        <li className="feed-item">
          <div className="feed-content">
            <div className="feed-name"> Email expired </div>
            <span className="feed-subject"> Re: Last Meeting </span>
            <span className="feed-time">
              {' '}
              <small>3:59 PM</small>{' '}
            </span>
            <span className="feed-clear" />
          </div>
        </li>
      </ul>
    </nav>
  </aside>
);

export default ActivityPanel;
