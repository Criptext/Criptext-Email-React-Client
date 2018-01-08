import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './activitypanel.css';
import Feed from './Feed';

class ActivityPanel extends Component {
  componentDidMount() {
    this.props.onLoadFeeds();
  }

  render(){
    let newSectionTitle = null, oldSectionTitle = null;
    if (this.props.newFeeds && this.props.newFeeds.length>0) {
      newSectionTitle = <li className="feed-section-title"><p className="text">NEW</p></li>
    }
    if (this.props.oldFeeds && this.props.oldFeeds.length>0) {
      oldSectionTitle = <li className="feed-section-title"><p className="text">OLDER</p></li>
    }
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
            {newSectionTitle}
            {this.props.newFeeds.map((feed, index) => {
              const unread = feed.get('unread');
              return <Feed key={index} feed={feed} unread={unread} />;
            })}
          </ul>
          <hr />
          <ul className="new-feeds">
            {oldSectionTitle}
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
