import React from 'react';
import PropTypes from 'prop-types';

const Feed = props => (
  <li className={'feed-item ' + (props.unread ? 'unread-feed' : '' )}>
    <div className="feed-content">
      <div className="feed-name">
        {props.feed.get("title")}
      </div>
      <span className="feed-subject">{props.feed.get("subtitle")}</span>
      <span className="feed-time">
        {props.feed.get("time")}
      </span>
      <span className="feed-clear"></span>
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