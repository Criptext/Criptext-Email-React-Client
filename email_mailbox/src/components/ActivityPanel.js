import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FeedItem from './../containers/FeedItem';
import { addEvent, Event } from '../utils/electronEventInterface';
import './activitypanel.css';

class ActivityPanel extends Component {
  constructor() {
    super();
    addEvent(Event.EMAIL_TRACKING_UPDATE, () => {
      this.props.onLoadFeeds();
    });
  }

  render() {
    return (
      <aside className="navigation-feed-container">
        <header>
          <div
            className="header-content"
            onClick={() => this.props.onToggleActivityPanel()}
          >
            {this.renderHeaderIcon()}
            <div className="header-title">ACTIVITY FEED</div>
            <div className="header-button">
              <i className="icon-next" />
            </div>
          </div>
        </header>
        <div className="navigation-feed-content">
          {this.renderFeedSection(this.props)}
        </div>
      </aside>
    );
  }

  componentDidMount() {
    this.props.onLoadFeeds();
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
          props.onClickThreadIdSelected,
          'NEW'
        )}
        {this.renderFeedList(
          props.oldFeeds,
          props.onClickThreadIdSelected,
          'OLDER'
        )}
      </div>
    );
  };

  renderFeedList = (feedList, onClickThreadIdSelected, listName) => {
    if (feedList && feedList.length > 0) {
      return (
        <ul className="new-feeds">
          <li className="feed-section-title">
            <p className="text">{listName}</p>
          </li>
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
      <div className="feed-content-empty">
        <div className="icon" />
        <div className="text">
          <span className="title">There&#39;s nothing new yet</span>
          <br />
          <span className="subtitle">Enjoy your day</span>
        </div>
      </div>
    );
  };
}

ActivityPanel.propTypes = {
  onLoadFeeds: PropTypes.func,
  onToggleActivityPanel: PropTypes.func
};

export default ActivityPanel;
