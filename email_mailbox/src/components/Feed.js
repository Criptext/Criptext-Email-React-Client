import React, { Component } from 'react';


class Feed extends Component {

  render(){
    const { 
      onRegionEnter, 
      onRegionLeave
    } = this.props;
    return (
      <li className={'feed-item ' + (this.props.unread ? 'unread-feed' : '')}>
        <div 
          className="feed-content" 
          onMouseEnter={onRegionEnter} 
          onMouseLeave={onRegionLeave}
        >
          <div className="feed-icon">{this.props.renderIcon()}</div>
          <div className="feed-data">
            <div className="feed-preview">
              <div className="feed-title"><span>{this.props.feed.get('title')}</span></div>
              <div className="feed-subject"><span>{this.props.feed.get('subtitle')}</span></div>
            </div>
            <div className="feed-actions-time">
              { this.renderFeedActions(this.props.feed) }
            </div>
          </div>
          <div className="feed-clear" />
        </div>
      </li>
    );
  }


  renderFeedActions = feed => {
    if (this.props.hovering) {
      return (
        <div className="feed-actions">
          <div className="feed-mute">
            <i className="icon-bell" title="Mute"></i>
          </div>
          <div className="feed-delete" 
            onClick={ () => {
              this.removeFeedFromPanel(this)} 
            }>
            <i className="icon-trash" title="Delete"></i>
          </div>
        </div>
      );
    }
    return (
      <div className="feed-time">
        <span>{this.props.feed.get('time')}</span>
      </div>
    );
  };

  removeFeedFromPanel = (parent) => {
    console.log(parent)
    this.props.removeFeed(this.props.feed.get('id'));
  }


}


export default Feed;
