import React from 'react';
import PropTypes from 'prop-types';
import { FeedActionType } from './../utils/const';

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
    className={
      'feed-item ' + (props.feed.get('unread') === 1 ? 'unread-feed' : '')
    }
    onClick={() => onSelectFeed(props)}
  >
    <a>
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
    </a>
  </li>
);

const onSelectFeed = props => {
  if (props.feed.get('unread') === 1) {
    props.onSelectFeed(props.feed.get('id'));
  }
  //props.onOpenThread(props.thread);
};

const renderFeedIcon = feed => {
  const action = feed.get('action');
  switch (action) {
    case FeedActionType.SENT.value: {
      return <i className={FeedActionType.SENT.icon} />;
    }
    case FeedActionType.DOWNLOADED.value: {
      return <i className={FeedActionType.DOWNLOADED.icon} />;
    }
    default: {
      return <i className={FeedActionType.OPENED.icon} />;
    }
  }
};

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
    <span>{props.feed.get('date')}</span>
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
  props.toggleMute(props.feed);
};

const removeFeedFromPanel = (ev, props) => {
  ev.preventDefault();
  ev.stopPropagation();
  props.onRemove();
  setTimeout(() => {
    const terminated = removeFeed(props);
    if (terminated) {
      props.onCleanRemove();
    }
  }, 3000);
};

const removeFeed = async props => {
  await props.onRemoveFeed(props.feed.get('id'));
  return true;
};

renderFeed.propTypes = {
  feed: PropTypes.object,
  title: PropTypes.string,
  subtitle: PropTypes.string,
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
