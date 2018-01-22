import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class Feed extends Component {
  render() {
    return <div>{this.renderFeedItem(this.props)}</div>;
  }

  renderFeedItem = props => {
    if (!props.isRemoved) {
      return (
        <div
          className={
            'feed-item ' + (props.feed.get('unread') ? 'unread-feed' : '')
          }
          onClick={this.onSelectFeed}
        >
          <Link to={`/inbox/${props.feed.get('threadId')}`}>
            <div
              className="feed-content"
              onMouseEnter={props.onRegionEnter}
              onMouseLeave={props.onRegionLeave}
            >
              <div className="feed-icon">{props.renderIcon()}</div>
              <div className="feed-data">
                <div className="feed-preview">
                  <div className="feed-title">
                    <span>{props.feed.get('title')}</span>
                  </div>
                  <div className="feed-subject">
                    <span>{props.feed.get('subtitle')}</span>
                  </div>
                </div>
                <div className="feed-actions-time">
                  {this.renderFeedActions(props.feed)}
                </div>
              </div>
              <div className="feed-clear" />
            </div>
          </Link>
        </div>
      );
    }
    return (
      <div className="deleted-feed">
        <div className="deleted-feed-icon">
          <i className="icon-trash"></i>
        </div>
        <div className="deleted-feed-content">
          <span>Deleted</span>
        </div>
      </div>
    );
  };

  renderFeedActions = feed => {
    if (this.props.hovering) {
      return (
        <div className="feed-actions">
          {this.renderNotificationIcon(this.props.feed.get('isMuted'))}
          <div className="feed-delete" onClick={this.removeFeedFromPanel}>
            <i className="icon-trash" />
          </div>
        </div>
      );
    }
    return (
      <div className="feed-time">
        <span>{feed.get('time')}</span>
      </div>
    );
  };

  renderNotificationIcon = isMuted => {
    if (isMuted) {
      return (
        <div className="feed-mute" onClick={this.onToggleMute}>
          <i className="icon-bell-mute" />
        </div>
      );
    }
    return (
      <div className="feed-mute" onClick={this.onToggleMute}>
        <i className="icon-bell" />
      </div>
    );
  };

  onToggleMute = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.toggleMute();
  };

  onSelectFeed = () => {
    this.props.onSelectFeed(this.props.feed);
  };

  removeFeedFromPanel = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.onRemove();
    window.setTimeout(() => {
      this.props.onRemoveFeed(this.props.feed);
      this.props.onCleanRemove();
    }, 1500);
  };
}

Feed.propTypes = {
  feed: PropTypes.object,
  onRegionEnter: PropTypes.func,
  onRegionLeave: PropTypes.func,
  renderIcon: PropTypes.func,
  hovering: PropTypes.bool,
  isMuted: PropTypes.bool,
  isRemoved: PropTypes.bool,
  toggleMute: PropTypes.func,
  onSelectFeed: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveFeed: PropTypes.func,
  onCleanRemove: PropTypes.func
};

export default Feed;
