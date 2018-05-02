import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DropfileField from './DropfileField';

class DropfileFieldWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <DropfileField
        {...this.props}
        getHtmlBody={this.props.getHtmlBody}
        htmlBody={this.props.htmlBody}
        files={this.props.files}
        isDragActive={this.props.isDragActive}
        onDragLeave={this.props.handleDragLeave}
        onDragOver={this.props.handleDragOver}
        onClearFile={this.props.onClearFile}
        onDrop={this.props.onDrop}
      />
    );
  }
}

DropfileFieldWrapper.propTypes = {
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.object,
  onDrop: PropTypes.func,
  files: PropTypes.array,
  isDragActive: PropTypes.bool,
  handleDragLeave: PropTypes.func,
  handleDragOver: PropTypes.func,
  onClearFile: PropTypes.func
};

export default DropfileFieldWrapper;
