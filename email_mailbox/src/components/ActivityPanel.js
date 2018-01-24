import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './activitypanel.css';
import Feed from './../containers/Feed';

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
            return <Feed key={index} feed={feed} />;
          })}
        </ul>
      );
    }
    return null;
  };

  renderHeaderIcon = () => {
    return (
      <div className="feed-header-icon">
        <i className={'icon-bell'} />
      </div>
    );
  };
}

ActivityPanel.propTypes = {
  newFeeds: PropTypes.object,
  oldFeeds: PropTypes.object,
  onLoadFeeds: PropTypes.func
};

export default ActivityPanel;
