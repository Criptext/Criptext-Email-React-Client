import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Composer from './../components/Composer';
import { Status } from './../components/Control';
import { EditorState, DefaultDraftBlockRenderMap } from 'draft-js';
import {
  composerEvents,
  closeComposerWindow,
  createEmail,
  LabelType,
  myAccount,
  throwError,
  updateEmail,
  saveDraftChanges,
  errors,
  deleteEmailsByIds,
  getEmailByKey,
  createEmailLabel,
  getEmailToEdit,
  createFile
} from './../utils/electronInterface';
import {
  areEmptyAllArrays,
  updateObjectFieldsInArray
} from './../utils/ArrayUtils';
import signal from './../libs/signal';
import {
  EmailStatus,
  formOutgoingEmailFromData,
  formDataToEditDraft,
  formDataToReply
} from './../utils/EmailUtils';
import { Map } from 'immutable';
import {
  formFileParamsToDatabase,
  getFileParamsToSend
} from './../utils/FileUtils';
import {
  fileManager,
  CHUNK_SIZE,
  FILE_ERROR,
  FILE_FINISH,
  FILE_MODES,
  FILE_PROGRESS
} from './../utils/FileUtils';

const PrevMessage = props => (
  <div className="content-prev-message">{props.children}</div>
);

const blockRenderMap = DefaultDraftBlockRenderMap.merge(
  Map({ blockquote: { wrapper: <PrevMessage /> } })
);

class ComposerWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bccEmails: [],
      ccEmails: [],
      files: [],
      htmlBody: EditorState.createEmpty(),
      isCollapsedMoreRecipient: true,
      isDragActive: false,
      status: undefined,
      textSubject: '',
      threadId: undefined,
      toEmails: []
    };
  }

  render() {
    return (
      <Composer
        {...this.props}
        bccEmails={this.state.bccEmails}
        blockRenderMap={blockRenderMap}
        ccEmails={this.state.ccEmails}
        files={this.state.files}
        getBccEmails={this.handleGetBccEmail}
        getCcEmails={this.handleGetCcEmail}
        getTextSubject={this.handleGetSubject}
        getToEmails={this.handleGetToEmail}
        getHtmlBody={this.handleGetHtmlBody}
        handleDragLeave={this.handleDragLeave}
        handleDragOver={this.handleDragOver}
        htmlBody={this.state.htmlBody}
        isCollapsedMoreRecipient={this.state.isCollapsedMoreRecipient}
        isDragActive={this.state.isDragActive}
        onClearFile={this.handleClearFile}
        onClickDiscardDraft={this.handleClickDiscardDraft}
        onClickSendMessage={this.handleSendMessage}
        onDrop={this.handleDrop}
        onPauseUploadFile={this.handlePauseUploadFile}
        onResumeUploadFile={this.handleResumeUploadFile}
        onToggleRecipient={this.handleToggleRecipient}
        status={this.state.status}
        textSubject={this.state.textSubject}
        toEmails={this.state.toEmails}
      />
    );
  }

  async componentDidMount() {
    const emailToEdit = getEmailToEdit();
    if (emailToEdit) {
      const { key, type } = emailToEdit;
      const emailData = await this.getComposerDataByType(key, type);
      const state = { ...emailData, status: Status.ENABLED };
      this.setState(state);
    }
    fileManager.on(FILE_PROGRESS, this.handleUploadProgress);
    fileManager.on(FILE_FINISH, this.handleUploadSuccess);
    fileManager.on(FILE_ERROR, this.handleUploadError);
  }

  getComposerDataByType = async (key, type) => {
    if (type === composerEvents.EDIT_DRAFT) {
      return await formDataToEditDraft(key);
    }
    return await formDataToReply(key, type);
  };

  handleClickDiscardDraft = () => {
    closeComposerWindow();
  };

  handleGetToEmail = emails => {
    const status = areEmptyAllArrays(
      emails,
      this.state.ccEmails,
      this.state.bccEmails
    )
      ? undefined
      : Status.ENABLED;
    this.setState({ toEmails: emails, status }, () => this.saveTemporalDraft());
  };

  handleGetCcEmail = emails => {
    const status = areEmptyAllArrays(
      this.state.toEmails,
      emails,
      this.state.bccEmails
    )
      ? undefined
      : Status.ENABLED;
    this.setState({ ccEmails: emails, status }, () => this.saveTemporalDraft());
  };

  handleGetBccEmail = emails => {
    const status = areEmptyAllArrays(
      this.state.toEmails,
      this.state.ccEmails,
      emails
    )
      ? undefined
      : Status.ENABLED;
    this.setState({ bccEmails: emails, status }, () =>
      this.saveTemporalDraft()
    );
  };

  handleGetSubject = text => {
    this.setState({ textSubject: text }, () => this.saveTemporalDraft());
  };

  handleGetHtmlBody = htmlBody => {
    this.setState({ htmlBody }, () => this.saveTemporalDraft());
  };

  getFilesFromEvent = ev => {
    return ev.dataTransfer ? ev.dataTransfer.files : ev.target.files;
  };

  handleDrop = e => {
    e.preventDefault();
    this.setState({
      isDragActive: false
    });
    const files = this.getFilesFromEvent(e);
    this.setFiles(files);
  };

  setFiles = newFiles => {
    if (newFiles && newFiles.length > 0) {
      const [firstNewFile, ...remainingNewFiles] = Array.from(newFiles);
      fileManager.uploadFile(firstNewFile, CHUNK_SIZE, (error, token) => {
        if (error) {
          return this.handleUploadError();
        }
        const uploadingFile = {
          fileData: firstNewFile,
          token,
          percentage: 0,
          mode: FILE_MODES.UPLOADING
        };
        const files = [...this.state.files, uploadingFile];
        this.setState({ files }, () => {
          this.setFiles(remainingNewFiles);
        });
      });
    }
  };

  handleUploadProgress = data => {
    const { percentage, token } = data;
    const files = updateObjectFieldsInArray(this.state.files, 'token', token, {
      percentage
    });
    this.setState({ files });
  };

  handleUploadSuccess = ({ token }) => {
    const files = updateObjectFieldsInArray(this.state.files, 'token', token, {
      mode: FILE_MODES.UPLOADED,
      percentage: 100
    });
    this.setState({ files });
  };

  handleUploadError = ({ token }) => {
    const files = updateObjectFieldsInArray(this.state.files, 'token', token, {
      mode: FILE_MODES.FAILED
    });
    this.setState({ files });
  };

  handlePauseUploadFile = token => {
    fileManager.pauseUpload(token, error => {
      if (!error) {
        const files = updateObjectFieldsInArray(
          this.state.files,
          'token',
          token,
          { mode: FILE_MODES.PAUSED }
        );
        this.setState({ files });
      }
    });
  };

  handleResumeUploadFile = token => {
    fileManager.resumeUpload(token, error => {
      if (!error) {
        const files = updateObjectFieldsInArray(
          this.state.files,
          'token',
          token,
          { mode: FILE_MODES.UPLOADING }
        );
        this.setState({ files });
      }
    });
  };

  handleClearFile = token => {
    const files = this.state.files.filter(file => {
      return file.token !== token;
    });
    this.setState({ files });
  };

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

  handleSendMessage = async () => {
    this.setState({ status: Status.WAITING });
    const { data, to, subject, body } = formOutgoingEmailFromData(
      this.state,
      LabelType.sent.id
    );
    let emailId, key;
    try {
      [emailId] = await createEmail(data);

      const files = getFileParamsToSend(this.state.files);
      const peer = {
        recipientId: myAccount.recipientId,
        type: 'peer',
        deviceId: myAccount.deviceId
      };
      const recipients = [...to, peer];
      const params = {
        subject,
        threadId: this.state.threadId,
        recipients,
        body,
        files,
        peer
      };
      const res = await signal.encryptPostEmail(params);
      const filesDbParams = formFileParamsToDatabase(this.state.files, emailId);
      if (filesDbParams.length) {
        await createFile(filesDbParams);
      }

      const { metadataKey, date } = res.body;
      const threadId = this.state.threadId || res.body.threadId;
      key = metadataKey;
      const emailParams = {
        id: emailId,
        key,
        threadId,
        date,
        status: EmailStatus.SENT
      };
      await updateEmail(emailParams);

      closeComposerWindow(emailId);
    } catch (e) {
      if (e.message.includes('SQLITE_CONSTRAINT')) {
        // To remove
        await deleteEmailsByIds([emailId]);
        const email = await getEmailByKey(key);
        const emailLabels = [
          { emailId: email[0].id, labelId: LabelType.sent.id }
        ];
        await createEmailLabel(emailLabels);
        closeComposerWindow();
      } else if (e.code === 'ECONNREFUSED') {
        throwError(errors.server.UNABLE_TO_CONNECT);
      } else {
        const errorToShow = {
          name: e.name,
          description: e.message
        };
        throwError(errorToShow);
      }
      this.setState({ status: Status.ENABLED });
    }
  };

  handleToggleRecipient = value => {
    this.setState({
      isCollapsedMoreRecipient:
        value !== undefined ? value : !this.state.isCollapsedMoreRecipient
    });
  };

  saveTemporalDraft = () => {
    const { data } = formOutgoingEmailFromData(this.state, LabelType.draft.id);
    saveDraftChanges(data);
  };
}

PrevMessage.propTypes = {
  children: PropTypes.array
};

export default ComposerWrapper;
