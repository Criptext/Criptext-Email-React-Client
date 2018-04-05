import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DropfileField from './DropfileField';

class DropfileFieldWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDragActive: false,
      files: []
    };
  }

  render() {
    return (
      <DropfileField
        {...this.props}
        files={this.state.files}
        getHtmlBody={this.props.getHtmlBody}
        htmlBody={this.props.htmlBody}
        isDragActive={this.state.isDragActive}
        onClearFile={this.handleClearFile}
        onDragLeave={this.handleDragLeave}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
      />
    );
  }

  handleDragLeave = () => {
    if (this.state.isDragActive) {
      this.setState({
        isDragActive: false
      });
    }
  };

  handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const dragType = e.dataTransfer.types;
    if (!this.state.isDragActive && !dragType.includes('text/plain')) {
      this.setState({
        isDragActive: true
      });
    }
  };

  handleDrop = e => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    this.setFiles(files, e);
  };

  handleClearFile = filename => {
    const files = this.state.files.filter(file => {
      return file.name !== filename;
    });
    this.setState({ files: files });
  };

  setFiles = (_files, e) => {
    if (_files && _files.length > 0) {
      const newFiles = Array.from(_files);
      const files = newFiles.concat(this.state.files);
      this.setState({
        files,
        isDragActive: false
      });
      if (this.props.onDrop) {
        this.props.onDrop(e, files);
      }
    }
  };
}

DropfileFieldWrapper.propTypes = {
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.object,
  onDrop: PropTypes.func
};

export default DropfileFieldWrapper;
