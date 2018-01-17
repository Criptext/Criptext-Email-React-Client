import React, { Component } from 'react';
import Feed from './Feed';

const feedWrapper = Feed =>
  class FeedWrapper extends Component {
    constructor() {
      super();
      this.state = {
        hovering: false
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

    render() {
      return (
        <Feed
          {...this.props}
          onRegionEnter={this.onRegionEnter}
          onRegionLeave={this.onRegionLeave}
          hovering={this.state.hovering}
        />
      );
    }
  };

const Wrapper = feedWrapper(Feed);

export default Wrapper;
