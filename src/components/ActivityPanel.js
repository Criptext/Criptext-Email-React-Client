import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './activitypanel.css';
import Feed from './Feed';

class ActivityPanel extends Component {
  render() {
    return (
      <aside className="navigation-feed">
        <header>
          <div className="header-content">
            { this.renderHeaderIcon() }
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
            return (
              <div onClick={ () => this.onSelectFeed(feed) }>
              <Link to={`/inbox/${feed.get('threadId')}`}>
                <Feed key={index} 
                  feed={feed} 
                  unread={feed.get('unread')} 
                  renderIcon={() => this.renderFeedIcon(feed.get('cmd'))} />
              </Link>
              </div>
            );
          })}
        </ul>
      );
    }
    return null;
  }

  onSelectFeed = (feed) => {
    if (feed.get('unread')) {
      this.props.onSelectFeed(feed.get("id"));
    }
  };

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

  renderHeaderIcon = () => {
    return(
      <div className="feed-header-icon">
        <i className={'icon-bell ' + this.props.badgeClass} data-badge={this.props.badgeData}></i>
      </div>
    );
  }


}

export default ActivityPanel;
