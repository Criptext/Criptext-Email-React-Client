import React from 'react';
import PropTypes from 'prop-types';
import { FeedItemType } from './../utils/const';

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
    className={'feed-item ' + (props.seen === 0 ? 'unread-feed' : '')}
    onClick={() => onSelectFeed(props)}
  >
    <div
      className="feed-content"
      onMouseEnter={props.onRegionEnter}
      onMouseLeave={props.onRegionLeave}
    >
      <div className="feed-icon">{renderFeedIcon(props.feed)}</div>
      <div className="feed-data">
        <div className="feed-preview">
          <div className="feed-title">
            <span>{props.title}</span>
          </div>
          <div className="feed-subject">
            <span>{props.subtitle}</span>
          </div>
        </div>
        <div className="feed-actions-time">{renderFeedActions(props)}</div>
      </div>
      <div className="feed-clear" />
    </div>
  </li>
);

const onSelectFeed = props => {
  if (props.seen === 0) {
    props.onSelectFeed();
  }
};

const renderFeedIcon = feed => {
  const { action } = feed;
  switch (action) {
    case FeedItemType.DOWNLOADED.value: {
      return <i className={FeedItemType.DOWNLOADED.icon} />;
    }
    default: {
      return <i className={FeedItemType.OPENED.icon} />;
    }
  }
};

const renderFeedActions = props =>
  props.isHovering ? renderHoveringActions(props) : renderTime(props);

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
    <span>{props.date}</span>
  </div>
);

const renderNotificationIcon = props =>
  props.isMuted === 1 ? renderMutedIcon(props) : renderUnmutedIcon(props);

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
  props.toggleMute();
};

const removeFeedFromPanel = (ev, props) => {
  ev.preventDefault();
  ev.stopPropagation();
  props.onRemove();
  setInterval(async () => {
    await props.onRemoveFeed();
    props.onCleanRemove();
  }, 3000);
};

Feed.propTypes = {
  isRemoved: PropTypes.bool
};

renderFeed.propTypes = {
  feed: PropTypes.object,
  onRegionEnter: PropTypes.func,
  onRegionLeave: PropTypes.func,
  seen: PropTypes.number,
  subtitle: PropTypes.string,
  title: PropTypes.string
};

onSelectFeed.propTypes = {
  onSelectFeed: PropTypes.func,
  seen: PropTypes.number
};

renderFeedActions.propTypes = {
  isHovering: PropTypes.bool
};

renderTime.propTypes = {
  date: PropTypes.string
};

renderNotificationIcon.propTypes = {
  isMuted: PropTypes.bool
};

onToggleMute.propTypes = {
  toggleMute: PropTypes.func
};

removeFeedFromPanel.propTypes = {
  onCleanRemove: PropTypes.func,
  onLoadFeeds: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveFeed: PropTypes.func
};

export default Feed;
