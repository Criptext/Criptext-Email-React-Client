import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SideBar from './SideBar';
import { SectionType } from './../utils/const';

class SideBarWrapper extends Component {
  constructor() {
    super();
    this.state = {
      showLabels: false
    };
  }

  render() {
    return (
      <SideBar
        {...this.props}
        onClickSection={this.handleClickSection}
        onToggleShowLabelView={this.handleToggleShowLabelView}
        showLabels={this.state.showLabels}
      />
    );
  }

  componentDidMount() {
    this.props.onLoadLabels();
  }

  handleToggleShowLabelView = () => {
    this.setState({ showLabels: !this.state.showLabels });
  };

  handleClickSection = mailboxSelected => {
    const type = SectionType.MAILBOX;
    const params = { mailboxSelected };
    this.props.onClickSection(type, params);
  };
}

SideBarWrapper.propTypes = {
  onClickSection: PropTypes.func,
  onLoadLabels: PropTypes.func
};

export default SideBarWrapper;
