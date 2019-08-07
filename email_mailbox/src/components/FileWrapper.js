import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  setCancelDownloadHandler,
  setFileProgressHandler,
  setFileSuccessHandler,
  setFileErrorHandler,
  setDownloadHandler,
  setCryptoInterfaces
} from './../utils/FileManager';
import File, { FileStatus, UNSENT_FILE_STATUS } from './File';
import { downloadFileInFileSystem, openFileExplorer } from '../utils/ipc';

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
    const status = this.defineFileStatus(this.props.file.status);
    return (
      <File
        {...this.props}
        displayProgressBar={this.state.displayProgressBar}
        onClickCancelDownloadFile={this.handleClickCancelDownload}
        onDownloadFile={this.handleDownload}
        percentage={this.state.percentage}
        status={status}
      />
    );
  }

  componentDidMount() {
    setFileProgressHandler(this.handleDownloadProgess);
    setFileSuccessHandler(this.handleDownloadSuccess);
    setFileErrorHandler(this.handleDownloadError);
    setCryptoInterfaces(this.props.file.key, this.props.file.iv);
  }

  defineFileStatus = fileStatus => {
    return fileStatus === UNSENT_FILE_STATUS
      ? FileStatus.UNAVAILABLE
      : this.state.status;
  };

  handleDownload = async () => {
    const { token, name } = this.props.file;
    await setDownloadHandler(token, name);
    this.setState({
      displayProgressBar: true,
      status: FileStatus.DOWNLOADING
    });
  };

  handleClickCancelDownload = async e => {
    e.stopPropagation();
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
        async () => {
          const { filename } = await downloadFileInFileSystem({
            url,
            filename: this.props.file.name,
            downloadType: 'attachment',
            filesize: this.props.file.size
          });
          if (filename) openFileExplorer(filename);
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
  file: PropTypes.object,
  email: PropTypes.object
};

export default FileWrapper;
