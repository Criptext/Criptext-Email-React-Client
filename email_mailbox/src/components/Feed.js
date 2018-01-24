import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FeedCommand } from './../utils/const';

const Feed = props =>
  props.isRemoved ? renderDeletedFeed() : renderFeed(props);

const renderDeletedFeed = () => (
  <div className="deleted-feed">
    <div className="deleted-feed-icon">
      <i className="icon-trash" />
    </div>
    <div className="deleted-feed-content">
      <span>Deleted</span>
    </div>
  </div>
);

const renderFeed = props => (
  <li
    className={'feed-item ' + (props.feed.get('unread') ? 'unread-feed' : '')}
    onClick={() => onSelectFeed(props)}
  >
    <Link to={`/inbox/${props.feed.get('threadId')}`}>
      <div
        className="feed-content"
        onMouseEnter={props.onRegionEnter}
        onMouseLeave={props.onRegionLeave}
      >
        <div className="feed-icon">{renderFeedIcon(props.feed)}</div>
        <div className="feed-data">
          <div className="feed-preview">
            <div className="feed-title">
              <span>{props.feed.get('title')}</span>
            </div>
            <div className="feed-subject">
              <span>{props.feed.get('subtitle')}</span>
            </div>
          </div>
          <div className="feed-actions-time">{renderFeedActions(props)}</div>
        </div>
        <div className="feed-clear" />
      </div>
    </Link>
  </li>
);

const onSelectFeed = props =>
  props.feed.get('unread') ? props.onSelectFeed(props.feed.get('id')) : null;

const renderFeedIcon = feed =>
  feed.get('cmd') === FeedCommand.SENT.value ? (
    <i className={FeedCommand.SENT.icon} />
  ) : FeedCommand.EXPIRED.value ? (
    <i className={FeedCommand.EXPIRED.icon} />
  ) : FeedCommand.OPENED.value ? (
    <i className={FeedCommand.OPENED.icon} />
  ) : null;

const renderFeedActions = props =>
  props.hovering ? renderHoveringActions(props) : renderTime(props);

const renderHoveringActions = props => (
  <div className="feed-actions">
    {renderNotificationIcon(props)}
    <div className="feed-delete" onClick={ev => removeFeedFromPanel(ev, props)}>
      <i className="icon-trash" />
    </div>
  </div>
);

const renderTime = props => (
  <div className="feed-time">
    <span>{props.feed.get('time')}</span>
  </div>
);

const renderNotificationIcon = props =>
  props.isMuted ? renderMutedIcon(props) : renderUnmutedIcon(props);

const renderMutedIcon = props => (
  <div className="feed-mute" onClick={ev => onToggleMute(ev, props)}>
    <i className="icon-bell-mute" />
  </div>
);

const renderUnmutedIcon = props => (
  <div className="feed-mute" onClick={ev => onToggleMute(ev, props)}>
    <i className="icon-bell" />
  </div>
);

const onToggleMute = (ev, props) => {
  ev.preventDefault();
  ev.stopPropagation();
  props.toggleMute(props.feed.get('threadId'));
};

const removeFeedFromPanel = (ev, props) => {
  ev.preventDefault();
  ev.stopPropagation();
  props.onRemove();
  setTimeout(() => {
    removeFeed(props);
    props.onCleanRemove();
  }, 1500);
};

const removeFeed = props => {
  props.onRemoveFeed(props.feed.get('id'));
};

renderFeed.propTypes = {
  feed: PropTypes.object,
  onRegionEnter: PropTypes.func,
  onRegionLeave: PropTypes.func
};

renderTime.propTypes = {
  feed: PropTypes.object
};

onToggleMute.propTypes = {
  toggleMute: PropTypes.func,
  feed: PropTypes.object
};

removeFeedFromPanel.propTypes = {
  onRemove: PropTypes.func,
  onCleanRemove: PropTypes.func
};

removeFeed.propTypes = {
  onRemoveFeed: PropTypes.func
};

Feed.propTypes = {
  feed: PropTypes.object,
  hovering: PropTypes.bool,
  isRemoved: PropTypes.bool,
  onSelectFeed: PropTypes.func
};

export default Feed;
