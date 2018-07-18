import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { saveBlobAsFile } from './../utils/FileUtils';
import {
  setCancelDownloadHandler,
  setFileProgressHandler,
  setFileSuccessHandler,
  setFileErrorHandler,
  setDownloadHandler
} from './../utils/FileManager';
import File, { FileStatus } from './File';

class FileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percentage: 0,
      displayProgressBar: false,
      status: FileStatus.NORMAL
    };
  }

  render() {
    return (
      <File
        {...this.props}
        displayProgressBar={this.state.displayProgressBar}
        onClickCancelDownloadFile={this.handleClickCancelDownload}
        onDownloadFile={this.handleDownload}
        percentage={this.state.percentage}
        status={this.state.status}
      />
    );
  }

  componentDidMount() {
    setFileProgressHandler(this.handleDownloadProgess);
    setFileSuccessHandler(this.handleDownloadSuccess);
    setFileErrorHandler(this.handleDownloadError);
  }

  handleDownload = async () => {
    await setDownloadHandler(this.props.file.token);
    this.setState({
      displayProgressBar: true,
      status: FileStatus.DOWNLOADING
    });
  };

  handleClickCancelDownload = async () => {
    await setCancelDownloadHandler(this.props.file.token);
    this.setState({
      percentage: 0,
      displayProgressBar: false,
      status: FileStatus.NORMAL
    });
  };

  handleDownloadProgess = ({ percentage, token }) => {
    if (this.props.file.token === token) {
      this.setState({ percentage });
    }
  };

  handleDownloadSuccess = ({ url, token }) => {
    if (this.props.file.token === token) {
      this.setState(
        {
          percentage: 100,
          displayProgressBar: false,
          status: FileStatus.DOWNLOADED
        },
        () => {
          const { name, mimeType } = this.props.file;
          saveBlobAsFile(url, mimeType, name);
        }
      );
    }
  };

  handleDownloadError = ({ token }) => {
    if (this.props.file.token === token) {
      this.setState({
        displayProgressBar: false,
        status: FileStatus.FAILED
      });
    }
  };
}

FileWrapper.propTypes = {
  file: PropTypes.object
};

export default FileWrapper;
