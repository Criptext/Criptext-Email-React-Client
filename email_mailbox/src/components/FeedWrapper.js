import React, { Component } from 'react';
import Feed from './Feed';

const feedWrapper = Feed =>
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
    }

    onClean = () => {
      this.setState({
        isRemoved: false
      });
    }

    render() {
      return (
        <Feed
          {...this.props}
          onRegionEnter={this.onRegionEnter}
          onRegionLeave={this.onRegionLeave}
          hovering={this.state.hovering}
          isRemoved={this.state.isRemoved}
          onRemove={this.onRemove}
          onClean={this.onClean}
        />
      );
    }
  };

const Wrapper = feedWrapper(Feed);

export default Wrapper;
