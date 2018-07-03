import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ThreadItem from './ThreadItem';
import { LabelType } from '../utils/electronInterface';

class ThreadItemWrapper extends Component {
  constructor() {
    super();
    this.state = {
      hovering: false
    };
  }

  render() {
    return (
      <ThreadItem
        {...this.props}
        onToggleFavorite={this.handleToggleFavorite}
        onClickMoveToTrash={this.handleClickMoveToTrash}
        onRegionEnter={this.onRegionEnter}
        onRegionLeave={this.onRegionLeave}
        hovering={this.state.hovering}
      />
    );
  }

  handleToggleFavorite = () => {
    this.props.onAddOrRemoveLabel(LabelType.starred.id);
  };

  handleClickMoveToTrash = () => {
    this.props.onAddMoveLabel(LabelType.trash.id);
  };

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
}

ThreadItemWrapper.propTypes = {
  onAddMoveLabel: PropTypes.func,
  onAddOrRemoveLabel: PropTypes.func
};

export default ThreadItemWrapper;
