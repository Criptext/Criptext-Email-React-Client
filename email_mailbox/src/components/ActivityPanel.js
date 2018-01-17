import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './activitypanel.css';
import Feed from './Feed';
import { FeedCommand } from './../utils/const';

class ActivityPanel extends Component {
  render() {
    return (
      <aside className="navigation-feed">
        <header>
          <div className="header-content">
            {this.renderHeaderIcon()}
            <div className="header-title">ACTIVITY FEED</div>
            <div className="header-button">
              <i className="icon-next" />
            </div>
            <div className="header-clear" />
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
              <li key={index} onClick={() => this.onSelectFeed(feed)}>
                <Link to={`/inbox/${feed.get('threadId')}`}>
                  <Feed
                    key={index}
                    feed={feed}
                    unread={feed.get('unread')}
                    renderIcon={() => this.renderFeedIcon(feed.get('cmd'))}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      );
    }
    return null;
  };

  onSelectFeed = feed => {
    if (feed.get('unread')) {
      this.props.onSelectFeed(feed.get('id'));
    }
  };

  renderFeedIcon = cmd => {
    switch (cmd) {
      case FeedCommand.SENT.value:
        return <i className={FeedCommand.SENT.icon}></i>;
      case FeedCommand.EXPIRED.value:
        return <i className={FeedCommand.EXPIRED.icon}></i>;
      case FeedCommand.OPENED.value:
        return <i className={FeedCommand.OPENED.icon}></i>;
      default:
        return null;
    }
  };

  renderHeaderIcon = () => {
    return (
      <div className="feed-header-icon">
        <i
          className={'icon-bell ' + this.props.badgeClass}
          data-badge={this.props.badgeData}
        />
      </div>
    );
  };
}

ActivityPanel.propTypes = {
  newFeeds: PropTypes.object,
  badgeClass: PropTypes.string,
  badgeData: PropTypes.string,
  oldFeeds: PropTypes.object,
  onLoadFeeds: PropTypes.func,
  onSelectFeed: PropTypes.func
};

export default ActivityPanel;
