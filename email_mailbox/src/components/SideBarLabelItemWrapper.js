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
        onDoubleClick={this.handleOnDoubleClick}
        onKeyPress={this.handleOnKeyPress}
        textEditable={this.state.textEditable}
        {...this.props}
      />
    );
  }

  handleOnDoubleClick = () => {
    this.setState({
      isEditable: true,
      textEditable: this.props.text
    });
  };

  handleOnBlur = () => {
    this.setState({
      isEditable: false
    });
  };

  handleOnChange = e => {
    this.setState({ textEditable: e.target.value });
  };

  handleOnKeyPress = e => {
    if (e.key === 'Enter') {
      if (e.target.value.trim() !== '') {
        this.props.onUpdateLabel(e.target.value.trim());
      }
      this.setState({
        isEditable: false,
        text: ''
      });
    }
  };
}

SideBarLabelItemWrapper.propTypes = {
  onUpdateLabel: PropTypes.func,
  text: PropTypes.string
};

export default SideBarLabelItemWrapper;
