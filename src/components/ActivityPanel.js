import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './activitypanel.css';
import Feed from './Feed';

class ActivityPanel extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.onLoadFeeds();
  }

  render(){
    return (
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
            {this.props.newFeeds.map((feed, index) => {
              return <Feed key={index} feed={feed} />;
            })}
          </ul>
          <ul className="new-feeds">
            <li className="feed-section-title">
              <p className="text"> OLDER </p>
            </li>
            {this.props.oldFeeds.map((feed, index) => {
              return <Feed key={index} feed={feed} />;
            })}
          </ul>
        </nav>
      </aside>
    );
  }

};

export default ActivityPanel;
