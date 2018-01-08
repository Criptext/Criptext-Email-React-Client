import React from 'react';
import PropTypes from 'prop-types';

const Feed = props => (
  <li className="feed-item">
    <div className="feed-content">
      <div className="feed-name">{props.feed.get("title")}</div>
      <span className="feed-subject">{props.feed.get("subtitle")}</span>
      <span className="feed-time">
        <small>{props.feed.get("time")}</small>
      </span>
      <span className="feed-clear" />
    </div>
  </li>  
);

Feed.propTypes = {
  email: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    time: PropTypes.string
  })
};

export default Feed;