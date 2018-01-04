import React, { Component } from 'react';
import ThreadItem from './ThreadItem';

const threadWrapper = ThreadItem =>
  class ThreadWrapper extends Component {
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
        <ThreadItem
          {...this.props}
          onRegionEnter={this.onRegionEnter}
          onRegionLeave={this.onRegionLeave}
          hovering={this.state.hovering}
        />
      );
    }
  };

const Wrapper = threadWrapper(ThreadItem);

export default Wrapper;
