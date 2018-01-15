import React from 'react';
import PropTypes from 'prop-types';

const Feed = props => (
  <li className={'feed-item ' + (props.unread ? 'unread-feed' : '')}>
    <div className="feed-content">
      <div className="feed-icon">{props.renderIcon()}</div>
      <div className="feed-data"> 
        <div className="feed-title"><span>{props.feed.get('title')}</span></div>
        <div className="feed-subject"><span>{props.feed.get('subtitle')}</span></div>
        <div className="feed-time"><span>{props.feed.get('time')}</span></div>
        <div className="feed-clear"></div>
      </div>
      <div className="feed-clear"></div>
    </div>
  </li>
);

Feed.propTypes = {
  feed: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    time: PropTypes.string
  })
};

export default Feed;
