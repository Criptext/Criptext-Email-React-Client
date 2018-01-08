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
          { this.props.newFeeds && this.props.newFeeds.length>0 ? 
            <ul className="new-feeds">
              <li className="feed-section-title"><p className="text">NEW</p></li>
              {this.props.newFeeds.map((feed, index) => {
                const unread = feed.get('unread');
                return <Feed key={index} feed={feed} unread={unread} />;
              })}
              <hr />
            </ul>
            : null
          }
          { this.props.oldFeeds && this.props.oldFeeds.length>0 ? 
            <ul className="new-feeds">
              <li className="feed-section-title"><p className="text">OLDER</p></li>
              {this.props.oldFeeds.map((feed, index) => {
                const unread = feed.get('unread');
                return <Feed key={index} feed={feed} unread={unread} />;
              })}
            </ul>
            : null
          }
        </nav>
      </aside>
    );
  }

};

export default ActivityPanel;
