import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SideBarLabelItem from './SideBarLabelItem';

class SideBarLabelItemWrapper extends Component {
  constructor() {
    super();
    this.state = {
      textEditable: '',
      isEditable: false
    };
  }

  render() {
    return (
      <SideBarLabelItem
        isEditable={this.state.isEditable}
        onBlur={this.handleOnBlur}
        onChange={this.handleOnChange}
        onClick={this.handleOnClick}
        onDoubleClick={this.handleOnDoubleClick}
        onKeyPress={this.handleOnKeyPress}
        textEditable={this.state.textEditable}
        {...this.props}
      />
    );
  }

  handleOnBlur = () => {
    this.setState({
      isEditable: false
    });
  };

  handleOnChange = e => {
    this.setState({ textEditable: e.target.value });
  };

  handleOnClick = () => {
    const mailboxSelected = {
      id: this.props.id,
      text: this.props.text
    };
    this.props.onClickSection(mailboxSelected);
  };

  handleOnDoubleClick = () => {
    if (this.props.type === 'none') {
      this.setState({
        isEditable: true,
        textEditable: this.props.text
      });
    }
  };

  handleOnKeyPress = e => {
    if (e.key === 'Enter') {
      if (e.target.value.trim() !== '') {
        this.props.onUpdateLabel(e.target.value.trim());
      }
      this.setState({
        isEditable: false,
        textEditable: ''
      });
    }
  };
}

SideBarLabelItemWrapper.propTypes = {
  onClickSection: PropTypes.func,
  onUpdateLabel: PropTypes.func,
  label: PropTypes.object
};

export default SideBarLabelItemWrapper;
