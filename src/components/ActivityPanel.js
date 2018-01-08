import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './activitypanel.css';
import Feed from './Feed';

class ActivityPanel extends Component {
  componentDidMount() {
    this.props.onLoadFeeds();
  }

  render() {
    return (
      <aside className="navigation-feed">
        <header>
          <div className="header-content">
            <div className="header-title"> ACTIVITY FEED </div>
            <div className="header-button"></div>
            <div className="header-clear"></div>
          </div>
        </header>
        <nav>
          <ul className="new-feeds">
            { this.props.newFeeds && this.props.newFeeds.length>0 ? 
              <li className="feed-section-title"><p className="text">NEW</p></li>
              : null
            }
            {this.props.newFeeds.map((feed, index) => {
              const unread = feed.get('unread');
              return <Feed key={index} feed={feed} unread={unread} />;
            })}
          </ul>
          <hr />
          <ul className="new-feeds">
            { this.props.oldFeeds && this.props.oldFeeds.length>0 ? 
              <li className="feed-section-title"><p className="text">OLDER</p></li>
              : null
            }
            {this.props.oldFeeds.map((feed, index) => {
              const unread = feed.get('unread');
              return <Feed key={index} feed={feed} unread={unread} />;
            })}
          </ul>
        </nav>
      </aside>
    );
  }

};

export default ActivityPanel;
