import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './activitypanel.css';
import FeedWrapper from './FeedWrapper';
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
              <li>
                <FeedWrapper
                  key={index}
                  feed={feed}
                  onSelectFeed={() => this.onSelectFeed(feed)}
                  renderIcon={() => this.renderFeedIcon(feed)}
                  onRemoveFeed={() => this.removeFeed(feed)}
                  toggleMute={() => this.toggleMute(feed)}
                />
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

  removeFeed = feed => {
    this.props.onRemoveFeed(feed.get('id'));
  };

  toggleMute = feed => {
    const threadId = feed.get('threadId');
    const feedId = feed.get('id');
    this.props.toggleMute(threadId, feedId);
  };

  renderFeedIcon = feed => {
    switch (feed.get('cmd')) {
      case FeedCommand.SENT.value:
        return <i className={FeedCommand.SENT.icon} />;
      case FeedCommand.EXPIRED.value:
        return <i className={FeedCommand.EXPIRED.icon} />;
      case FeedCommand.OPENED.value:
        return <i className={FeedCommand.OPENED.icon} />;
      default:
        return null;
    }
  };

  renderHeaderIcon = () => {
    return (
      <div className="feed-header-icon">
        <i className={'icon-bell'}></i>
      </div>
    );
  };
}

ActivityPanel.propTypes = {
  newFeeds: PropTypes.object,
  oldFeeds: PropTypes.object,
  unreadFeeds: PropTypes.number,
  badgeClass: PropTypes.string,
  badgeData: PropTypes.string,
  onLoadFeeds: PropTypes.func,
  onSelectFeed: PropTypes.func,
  onRemoveFeed: PropTypes.func,
  toggleMute: PropTypes.func
};

export default ActivityPanel;
