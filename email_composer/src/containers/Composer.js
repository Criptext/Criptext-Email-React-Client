import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Composer from './../components/Composer';
import { Status } from './../components/Control';
import {
  convertToRaw,
  DefaultDraftBlockRenderMap,
  EditorState
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
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
  createFile,
  sendEventToMailbox
} from './../utils/electronInterface';
import { EmailUtils } from './../utils/electronUtilsInterface';
import {
  areEmptyAllArrays,
  updateObjectFieldsInArray
} from './../utils/ArrayUtils';
import signal from './../libs/signal';
import {
  EmailStatus,
  formDataToEditDraft,
  formDataToReply,
  formComposerDataWithSignature,
  formNewEmailFromData,
  parseEmailAddress
} from './../utils/EmailUtils';
import { Map } from 'immutable';
import {
  formFileParamsToDatabase,
  getFileParamsToSend,
  setCryptoInterfaces
} from './../utils/FileUtils';
import {
  fileManager,
  CHUNK_SIZE,
  FILE_ERROR,
  FILE_FINISH,
  FILE_MODES,
  FILE_PROGRESS
} from './../utils/FileUtils';
import { appDomain } from '../utils/const';
import { generateKeyAndIv } from '../utils/AESUtils';

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
      displayNonCriptextPopup: false,
      files: [],
      htmlBody: EditorState.createEmpty(),
      isCollapsedMoreRecipient: true,
      isDragActive: false,
      iv: null,
      key: null,
      nonCriptextRecipientsPassword: '',
      nonCriptextRecipientsVerified: false,
      status: Status.DISABLED,
      textSubject: '',
      threadId: null,
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
        disableSendButtonOnInvalidEmail={
          this.handleDisableSendButtonOnInvalidEmail
        }
        displayNonCriptextPopup={this.state.displayNonCriptextPopup}
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
        onClickCancelSendMessage={this.handleClickCancelSendMessage}
        onClickDiscardDraft={this.handleClickDiscardDraft}
        onClickSendMessage={this.handleSendMessage}
        onDrop={this.handleDrop}
        onPauseUploadFile={this.handlePauseUploadFile}
        onResumeUploadFile={this.handleResumeUploadFile}
        onToggleRecipient={this.handleToggleRecipient}
        status={this.state.status}
        onSetNonCriptextRecipientsPassword={
          this.handleSetNonCriptextRecipientsPassword
        }
        textSubject={this.state.textSubject}
        toEmails={this.state.toEmails}
      />
    );
  }

  async componentDidMount() {
    const emailToEdit = getEmailToEdit();
    let state;
    if (emailToEdit) {
      const composerData = await this.getComposerDataByType(emailToEdit);
      state = { ...composerData, status: Status.ENABLED };
    } else {
      const composerData = await this.getDefaultComposerWithSignature();
      const status = myAccount.signatureEnabled
        ? Status.ENABLED
        : Status.DISABLED;
      state = { ...composerData, status };
    }
    const { key, iv } = generateKeyAndIv(null, 8);
    state = { ...state, key, iv };
    fileManager.on(FILE_PROGRESS, this.handleUploadProgress);
    fileManager.on(FILE_FINISH, this.handleUploadSuccess);
    fileManager.on(FILE_ERROR, this.handleUploadError);
    setCryptoInterfaces(key, iv);
    await this.setState(state);
  }

  getDefaultComposerWithSignature = async () => {
    return await formComposerDataWithSignature();
  };

  getComposerDataByType = async ({ key, keyEmailToRespond, data, type }) => {
    if (type === composerEvents.EDIT_DRAFT) {
      return await formDataToEditDraft(key);
    } else if (type === composerEvents.NEW_WITH_DATA) {
      return formNewEmailFromData(data);
    }
    return await formDataToReply(keyEmailToRespond, type);
  };

  handleClickDiscardDraft = () => {
    closeComposerWindow();
  };

  handleDisableSendButtonOnInvalidEmail = () => {
    this.setState(prevState => {
      if (prevState.status !== Status.DISABLED) {
        return { status: Status.DISABLED };
      }
    });
  };

  handleGetToEmail = emails => {
    const parsedEmails = emails.map(item => parseEmailAddress(item));
    const status = areEmptyAllArrays(
      parsedEmails,
      this.state.ccEmails,
      this.state.bccEmails
    )
      ? Status.DISABLED
      : Status.ENABLED;
    this.setState({ toEmails: parsedEmails, status }, () =>
      this.saveTemporalDraft()
    );
  };

  handleGetCcEmail = emails => {
    const parsedEmails = emails.map(item => parseEmailAddress(item));
    const status = areEmptyAllArrays(
      this.state.toEmails,
      parsedEmails,
      this.state.bccEmails
    )
      ? Status.DISABLED
      : Status.ENABLED;
    this.setState({ ccEmails: parsedEmails, status }, () =>
      this.saveTemporalDraft()
    );
  };

  handleGetBccEmail = emails => {
    const parsedEmails = emails.map(item => parseEmailAddress(item));
    const status = areEmptyAllArrays(
      this.state.toEmails,
      this.state.ccEmails,
      parsedEmails
    )
      ? Status.DISABLED
      : Status.ENABLED;
    this.setState({ bccEmails: parsedEmails, status }, () =>
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
          this.setState({
            files: [
              ...this.state.files,
              { fileData: firstNewFile, mode: FILE_MODES.FAILED }
            ]
          });
          return this.handleUploadError({ token });
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

  checkNonCriptextRecipients = () => {
    const { toEmails, ccEmails, bccEmails } = this.state;
    const recipients = [...toEmails, ...ccEmails, ...bccEmails];
    return recipients.find(recipient => {
      const formattedRecipient = recipient.email || recipient;
      return formattedRecipient.indexOf(`@${appDomain}`) < 0;
    });
  };

  handleClickCancelSendMessage = () => {
    this.setState({
      displayNonCriptextPopup: false,
      nonCriptextRecipientsPassword: ''
    });
  };

  handleSetNonCriptextRecipientsPassword = ({ password, displayPopup }) => {
    this.setState({
      nonCriptextRecipientsPassword: password,
      displayNonCriptextPopup: displayPopup,
      nonCriptextRecipientsVerified: true
    });
  };

  handleSendMessage = () => {
    const hasNonCriptextRecipients = this.checkNonCriptextRecipients();
    const isVerified = this.state.nonCriptextRecipientsVerified;
    if (hasNonCriptextRecipients && !isVerified) {
      this.setState({ displayNonCriptextPopup: true });
    } else {
      this.sendMessage();
    }
  };

  sendMessage = async () => {
    this.setState({ status: Status.WAITING });
    const data = {
      bccEmails: this.state.bccEmails,
      body: draftToHtml(convertToRaw(this.state.htmlBody.getCurrentContent())),
      ccEmails: this.state.ccEmails,
      files: this.state.files,
      iv: this.state.iv,
      key: this.state.key,
      labelId: LabelType.sent.id,
      textSubject: this.state.textSubject,
      toEmails: this.state.toEmails,
      threadId: this.state.threadId
    };
    const {
      emailData,
      criptextRecipients,
      externalRecipients,
      body
    } = EmailUtils.formOutgoingEmailFromData(data);
    let emailId, key;
    try {
      [emailId] = await createEmail(emailData);
      const files = getFileParamsToSend(this.state.files);
      const peer = {
        recipientId: myAccount.recipientId,
        type: 'peer',
        deviceId: myAccount.deviceId
      };
      const recipients = [...criptextRecipients, peer];
      const externalEmailPassword = this.state.nonCriptextRecipientsPassword;
      const params = {
        subject: emailData.email.subject,
        threadId: this.state.threadId,
        recipients,
        externalRecipients,
        body,
        files,
        peer,
        externalEmailPassword,
        key: this.state.key,
        iv: this.state.iv
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
      sendEventToMailbox('failed-to-send', undefined);
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
    const data = {
      bccEmails: this.state.bccEmails,
      body: draftToHtml(convertToRaw(this.state.htmlBody.getCurrentContent())),
      ccEmails: this.state.ccEmails,
      files: this.state.files,
      iv: this.state.iv,
      key: this.state.key,
      labelId: LabelType.draft.id,
      textSubject: this.state.textSubject,
      toEmails: this.state.toEmails,
      threadId: this.state.threadId
    };
    const { emailData } = EmailUtils.formOutgoingEmailFromData(data);
    saveDraftChanges(emailData);
  };
}

PrevMessage.propTypes = {
  children: PropTypes.array
};

export default ComposerWrapper;
