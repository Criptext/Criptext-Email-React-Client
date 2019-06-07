import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Attachment, { FileStatus } from './Attachment';
import { fileManager, FILE_MODES } from './../utils/FileUtils';

class AttachmentWrapper extends Component {
  render() {
    const { mode, percentage } = this.props.file;
    return (
      <Attachment
        {...this.props}
        file={this.props.file.fileData}
        status={this.defineStatus(mode)}
        percentage={percentage}
        onRemove={this.handleRemove}
        onPauseUploadFile={this.onPauseUploadFile}
        onResumeUploadFile={this.onResumeUploadFile}
      />
    );
  }

  handleRemove = () => {
    const { mode, token } = this.props.file;
    if (mode === FILE_MODES.UPLOADING) {
      return this.cancelUploadingFile();
    }
    return this.props.onClearFile(token);
  };

  cancelUploadingFile = () => {
    const { token } = this.props.file;
    fileManager.cancelUpload(token, error => {
      if (!error) return this.props.onClearFile(token);
    });
  };

  onPauseUploadFile = () => {
    this.props.onPauseUploadFile(this.props.file.token);
  };

  onResumeUploadFile = () => {
    this.props.onResumeUploadFile(this.props.file.token);
  };

  defineStatus = mode => {
    switch (mode) {
      case FILE_MODES.UPLOADING:
        return FileStatus.UPLOADING;
      case FILE_MODES.PAUSED:
        return FileStatus.PAUSED;
      case FILE_MODES.UPLOADED:
        return FileStatus.UPLOADED;
      case FILE_MODES.FAILED:
        return FileStatus.FAILED;
      default:
        return;
    }
  };
}

AttachmentWrapper.propTypes = {
  file: PropTypes.object,
  onClearFile: PropTypes.func,
  onPauseUploadFile: PropTypes.func,
  onResumeUploadFile: PropTypes.func
};

export default AttachmentWrapper;
