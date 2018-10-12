import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LabelAdd from '../components/LabelAdd';
import './labeladd.css';

class LabelAddWrapper extends Component {
  constructor() {
    super();
    this.state = {
      isHiddenAddLabel: true,
      labelToAdd: ''
    };
  }

  render() {
    return (
      <LabelAdd
        isHiddenAddLabel={this.state.isHiddenAddLabel}
        labelToAdd={this.state.labelToAdd}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onClick={this.handleClick}
        onKeyPress={this.handleKeyPress}
      />
    );
  }

  handleBlur = () => {
    this.setState({ isHiddenAddLabel: true });
  };

  handleClick = () => {
    this.setState({ isHiddenAddLabel: false });
  };

  handleChange = e => {
    this.setState({ labelToAdd: e.target.value });
  };

  handleKeyPress = e => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      this.props.onAddLabel(e.target.value.trim());
      this.setState({
        labelToAdd: '',
        isHiddenAddLabel: true
      });
    }
  };
}

LabelAddWrapper.propTypes = {
  labels: PropTypes.object,
  onAddLabel: PropTypes.func
};

export default LabelAddWrapper;
