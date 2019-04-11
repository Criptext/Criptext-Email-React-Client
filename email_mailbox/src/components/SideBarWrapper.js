import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SideBar from './SideBar';
import { ButtonStatus } from './Button';
import { SectionType } from './../utils/const';
import { openEmptyComposerWindow } from './../utils/ipc';

class SideBarWrapper extends Component {
  constructor() {
    super();
    this.state = {
      showLabels: false,
      buttonComposerStatus: ButtonStatus.NORMAL
    };
  }

  render() {
    return (
      <SideBar
        {...this.props}
        onClickButtonComposer={this.handleButtonComposer}
        buttonComposerStatus={this.state.buttonComposerStatus}
        onClickSection={this.handleClickSection}
        onToggleShowLabelView={this.handleToggleShowLabelView}
        showLabels={this.state.showLabels}
      />
    );
  }

  handleToggleShowLabelView = () => {
    this.setState({ showLabels: !this.state.showLabels });
  };

  handleButtonComposer = () => {
    this.setState({ buttonComposerStatus: ButtonStatus.DISABLED }, () => {
      openEmptyComposerWindow();
    });
    setTimeout(() => {
      this.setState({ buttonComposerStatus: ButtonStatus.NORMAL });
    }, 1000);
  };

  handleClickSection = mailboxSelected => {
    const type = SectionType.MAILBOX;
    const params = { mailboxSelected };
    this.props.onClickSection(type, params);
  };
}

SideBarWrapper.propTypes = {
  onClickSection: PropTypes.func
};

export default SideBarWrapper;
