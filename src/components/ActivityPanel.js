import React, { Component } from 'react';
import './activitypanel.css';
import Feed from './Feed';

class ActivityPanel extends Component {

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
          {this.renderFeedList(this.props.newFeeds, "NEW")}
          {this.renderFeedList(this.props.oldFeeds, "OLDER")}
        </nav>
      </aside>
    );
  }


  componentDidMount() {
    this.props.onLoadFeeds();
  }


  renderFeedList = (feedList, listName) => {
    if ( feedList && feedList.size>0 ) {
      return (
        <ul className="new-feeds">
          <li className="feed-section-title"><p className="text">{listName}</p></li>
          {feedList.map((feed, index) => {
            return <Feed key={index} feed={feed} unread={feed.get('unread')} />;
          })}
        </ul>  
      );
    }
    else {
      return null
    }
  }


};

export default ActivityPanel;
