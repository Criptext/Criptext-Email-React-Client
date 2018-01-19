import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptions from './HeaderThreadOptions';

class HeaderThreadOptionsWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayMoveMenu: false,
      displayTagsMenu: false,
      displayDotsMenu: false
    };
  }

  render() {
    return (
      <HeaderThreadOptions
        displayMoveMenu={this.state.displayMoveMenu}
        displayTagsMenu={this.state.displayTagsMenu}
        displayDotsMenu={this.state.displayDotsMenu}
        toggleMoveMenu={this.toggleMoveMenu}
        toggleTagsMenu={this.toggleTagsMenu}
        toggleDotsMenu={this.toggleDotsMenu}
        onMarkAsRead={this.onMarkAsRead}
        {...this.props}
      />
    );
  }

  toggleMoveMenu = () => {
    this.setState({
      displayMoveMenu: !this.state.displayMoveMenu
    });
  };

  toggleTagsMenu = () => {
    this.setState({
      displayTagsMenu: !this.state.displayTagsMenu
    });
  };

  toggleDotsMenu = () => {
    this.setState({
      displayDotsMenu: !this.state.displayDotsMenu
    });
  };

  onMarkAsRead = (threadsIds, read) => {
    this.setState(
      {
        displayDotsMenu: false
      },
      () => {
        this.props.onMarkRead(threadsIds, read);
      }
    );
  };
}

HeaderThreadOptionsWrapper.propTypes = {
  onMarkRead: PropTypes.func
};

export default HeaderThreadOptionsWrapper;
