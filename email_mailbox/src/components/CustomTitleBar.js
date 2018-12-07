import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TitleBar } from 'react-desktop/windows';
import { isWindows } from '../utils/OSUtils';
import {
  closeMailboxWindow,
  maximizeMailboxWindow,
  minimizeMailboxWindow
} from '../utils/ipc';

class CustomTitleBar extends Component {
  static defaultProps = {
    color: '#2d3039',
    theme: 'dark'
  };

  constructor(props) {
    super(props);
    this.state = { isMaximized: false };
  }

  toggleMaximize = () =>
    this.setState(
      {
        isMaximized: !this.state.isMaximized
      },
      () => {
        maximizeMailboxWindow();
      }
    );

  render() {
    const isWindowsOS = isWindows();
    return (
      isWindowsOS && (
        <TitleBar
          title=" "
          controls
          isMaximized={this.state.isMaximized}
          theme={this.props.theme}
          background={this.props.color}
          onCloseClick={closeMailboxWindow}
          onMinimizeClick={minimizeMailboxWindow}
          onMaximizeClick={this.toggleMaximize}
          onRestoreDownClick={this.toggleMaximize}
        />
      )
    );
  }
}

CustomTitleBar.propTypes = {
  color: PropTypes.string,
  theme: PropTypes.string
};

export default CustomTitleBar;
