import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FeedItem from './FeedItem';

const FeedItemStates = {
  DELETED: 'deleted',
  HOVERING: 'hovering',
  NORMAL: 'normal'
};

class FeedWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: FeedItemStates.NONE
    };
  }

  render() {
    return (
      <FeedItem
        {...this.props}
        isHovering={this.state.mode === FeedItemStates.HOVERING}
        isRemoved={this.state.mode === FeedItemStates.DELETED}
        onCleanRemove={this.onCleanRemove}
        onRegionEnter={this.onRegionEnter}
        onRegionLeave={this.onRegionLeave}
        onRemove={this.onRemove}
      />
    );
  }

  componentDidMount() {
    if (!this.props.title) {
      this.props.onLoadContactData();
    }
  }

  onRegionEnter = () => {
    this.setState({ mode: FeedItemStates.HOVERING });
  };

  onRegionLeave = () => {
    this.setState({ mode: FeedItemStates.NORMAL });
  };

  onRemove = () => {
    this.setState({ mode: FeedItemStates.DELETED });
  };

  onCleanRemove = () => {
    this.setState({ mode: FeedItemStates.NORMAL });
  };
}

FeedWrapper.propTypes = {
  onLoadContactData: PropTypes.func,
  title: PropTypes.string
};

export default FeedWrapper;
