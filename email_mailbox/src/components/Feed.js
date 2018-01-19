import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Feed extends Component {

  render(){
    return (
      <div>{ this.renderFeedItem(this.props) }</div>
    )
  }


  renderFeedItem = (props) => {
    if (!props.isRemoved) {
      return(
        <div 
          className={'feed-item ' + (props.unread ? 'unread-feed' : '')}
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
                  <div className="feed-title"><span>{props.feed.get('title')}</span></div>
                  <div className="feed-subject"><span>{props.feed.get('subtitle')}</span></div>
                </div>
                <div className="feed-actions-time">
                  { this.renderFeedActions(props.feed) }
                </div>
              </div>
              <div className="feed-clear" />
            </div>
          </Link>
        </div>
      );
    }
    return(
      <div className="deleted-feed">
        <span>Deleted</span>
      </div>
    );
  }


  renderFeedActions = feed => {
    if (this.props.hovering) {
      return (
        <div className="feed-actions">
          <div className="feed-mute">
            <i className="icon-bell"></i>
          </div>
          <div className="feed-delete" 
            onClick={this.removeFeedFromPanel}>
            <i className="icon-trash"></i>
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

  onSelectFeed = () => {
    this.props.onSelectFeed(this.props.feed);
  };

  removeFeedFromPanel = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.onRemove();
    window.setTimeout(() => {
      this.props.onRemoveFeed(this.props.feed);
      this.props.onClean();
    }, 1500);
  }


}


export default Feed;
