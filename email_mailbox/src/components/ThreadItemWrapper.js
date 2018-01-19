import React, { Component } from 'react';
import ThreadItem from './ThreadItem';

const threadItemWrapper = ThreadItem =>
  class ThreadItemWrapper extends Component {
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

const Wrapper = threadItemWrapper(ThreadItem);

export default Wrapper;
