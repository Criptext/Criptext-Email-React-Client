import React, { Component } from 'react';
import './activitypanel.css';
import Feed from './Feed';

class ActivityPanel extends Component {
  render() {
    return (
      <aside className="navigation-feed">
        <header>
          <div className="header-content">
            { this.renderHeaderIcon(100) }
            <div className="header-title">ACTIVITY FEED</div>
            <div className="header-button"><i className="icon-next"></i></div>
            <div className="header-clear"></div>
          </div>
        </header>
        <nav>
          {this.renderFeedList(this.props.newFeeds, 'NEW')}
          {this.renderFeedList(this.props.oldFeeds, 'OLDER')}
        </nav>
      </aside>
    );
  }

  componentDidMount() {
    this.props.onLoadFeeds();
  }

  renderFeedList = (feedList, listName) => {
    if (feedList && feedList.size > 0) {
      return (
        <ul className="new-feeds">
          <li className="feed-section-title">
            <p className="text">{listName}</p>
          </li>
          {feedList.map((feed, index) => {
            return <Feed key={index} feed={feed} unread={feed.get('unread')} renderIcon={() => this.renderFeedIcon(feed.get('cmd'))} />;
          })}
        </ul>
      );
    }
    return null;
  }


  renderFeedIcon = (cmd) => {
    switch (cmd) {
      case 1:
        return <i className="icon-calendar"></i>;
      case 2:
        return <i className="icon-attach"></i>;
      case 3:
        return <i className="icon-checked"></i>;
      default:
        return null;
    }
  }


  renderHeaderIcon = unreadFeeds => {
    console.log(unreadFeeds<10)
    console.log(unreadFeeds>10)
    if (unreadFeeds>0 && unreadFeeds<10) {
      return(
        <div className="feed-header-icon">
          <i className="icon-bell badge small-badge" data-badge={unreadFeeds}></i>
        </div>
      );
    }
    if (unreadFeeds>9 && unreadFeeds<100) {
      return(
        <div className="feed-header-icon">
          <i className="icon-bell badge big-badge" data-badge={unreadFeeds}></i>
        </div>
      );
    }
    if (unreadFeeds>99) {
      return(
        <div className="feed-header-icon">
          <i className="icon-bell badge very-big-badge" data-badge="+99"></i>
        </div>
      );
    }
    return(
      <div className="feed-header-icon">
        <i className="icon-bell"></i>
      </div>
    );
  }


}

export default ActivityPanel;
