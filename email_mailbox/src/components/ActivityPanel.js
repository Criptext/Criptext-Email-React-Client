import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FeedItem from './../containers/FeedItem';
import { addEvent, removeEvent, Event } from '../utils/electronEventInterface';
import string from '../lang';
import './activitypanel.scss';

class ActivityPanel extends Component {
  constructor() {
    super();
    addEvent(
      Event.EMAIL_TRACKING_UPDATE,
      this.emailTrackingUpdateListenerCallback
    );
  }

  render() {
    return (
      <aside className="navigation-feed-container">
        <header>
          <div
            className="header-content"
            onClick={() =>
              this.props.onToggleActivityPanel(this.props.feedItemIds)
            }
          >
            {this.renderHeaderIcon()}
            <div className="header-title">{string.activity.activity_feed}</div>
          </div>
        </header>
        <div className="navigation-feed-content cptx-scrollbar">
          {this.renderFeedSection(this.props)}
        </div>
      </aside>
    );
  }

  componentWillUnmount() {
    removeEvent(
      Event.EMAIL_TRACKING_UPDATE,
      this.emailTrackingUpdateListenerCallback
    );
  }

  renderHeaderIcon = () => {
    return (
      <div className="feed-header-icon">
        <i className={'icon-bell'} />
      </div>
    );
  };

  renderFeedSection = props => {
    if (props.newFeeds.length < 1 && props.oldFeeds.length < 1) {
      return this.renderEmptyFeedSection();
    }
    return (
      <div>
        {this.renderFeedList(
          props.newFeeds,
          props.newFeeds.length,
          props.onClickThreadIdSelected,
          string.activity.new
        )}
        {this.renderFeedList(
          props.oldFeeds,
          props.newFeeds.length,
          props.onClickThreadIdSelected,
          string.activity.older
        )}
      </div>
    );
  };

  renderFeedList = (
    feedList,
    feedNewSize,
    onClickThreadIdSelected,
    listName
  ) => {
    if (feedList && feedList.length > 0) {
      return (
        <ul className="new-feeds">
          {!!feedNewSize && (
            <li className="feed-section-title">
              <p className="text">{listName}</p>
            </li>
          )}

          {feedList.map((feed, index) => {
            return (
              <FeedItem
                key={index}
                feed={feed}
                onClickThreadIdSelected={onClickThreadIdSelected}
                onLoadFeeds={this.props.onLoadFeeds}
              />
            );
          })}
        </ul>
      );
    }
    return null;
  };

  renderEmptyFeedSection = () => {
    return (
      <div className="empty-container empty-activity-container">
        <div className="empty-content">
          <div className="empty-icon" />
          <div className="header-text">{string.activity.empty_title}</div>
          <div className="subheader-text">{string.activity.empty_message}</div>
        </div>
      </div>
    );
  };

  emailTrackingUpdateListenerCallback = () => {
    this.props.onLoadFeeds();
  };
}

ActivityPanel.propTypes = {
  feedItemIds: PropTypes.array,
  onLoadFeeds: PropTypes.func,
  onToggleActivityPanel: PropTypes.func
};

export default ActivityPanel;
