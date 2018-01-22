import React, { Component } from 'react';
import Feed from './Feed';

class FeedWrapper extends Component {

  constructor() {
    super();
    this.state = {
      hovering: false,
      isRemoved: false
    };
  }


  onRegionEnter = () => {
    this.setState({
      hovering: true
    });
  };


  onRegionLeave = () => {
    this.setState({
      hovering: false
    });
  };


  onRemove = () => {
    this.setState({
      isRemoved: true
    });
  };


  onCleanRemove = () => {
    this.setState({
      isRemoved: false
    });
  };


  render() {
    return (
      <Feed
        {...this.props}
        hovering={this.state.hovering}
        isMuted={this.state.isMuted}
        isRemoved={this.state.isRemoved}
        onCleanRemove={this.onCleanRemove}
        onRegionEnter={this.onRegionEnter}
        onRegionLeave={this.onRegionLeave}
        onRemove={this.onRemove}
      />
    );
  }

};



export default FeedWrapper;
