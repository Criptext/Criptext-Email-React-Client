import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Attachment from './Attachment';
import { fileManager, FILE_MODES } from './../utils/FileUtils';

class AttachmentWrapper extends Component {
  render() {
    const { mode, percentage } = this.props.file;
    return (
      <Attachment
        {...this.props}
        file={this.props.file.fileData}
        isLoading={mode === FILE_MODES.UPLOADING}
        isFailed={mode === FILE_MODES.FAILED}
        isPaused={mode === FILE_MODES.PAUSED}
        isFinished={mode === FILE_MODES.UPLOADED}
        percentage={percentage}
        onRemoveAttachment={this.onRemoveAttachment}
        onPauseUploadFile={this.onPauseUploadFile}
        onResumeUploadFile={this.onResumeUploadFile}
      />
    );
  }

  onRemoveAttachment = () => {
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
}

AttachmentWrapper.propTypes = {
  file: PropTypes.object,
  onClearFile: PropTypes.func,
  onPauseUploadFile: PropTypes.func,
  onResumeUploadFile: PropTypes.func
};

export default AttachmentWrapper;
