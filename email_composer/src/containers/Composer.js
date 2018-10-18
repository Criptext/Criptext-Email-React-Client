import React, { Component } from 'react';
import Composer from './../components/Composer';
import { Status } from './../components/Control';
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
import { addEvent, removeEvent, Event } from '../utils/electronEventInterface';

const MAX_RECIPIENTS_AMOUNT = 300;
const MAX_ATTACMENTS_AMOUNT = 5;

class ComposerWrapper extends Component {
  constructor(props) {
    super(props);
    this.emailToEdit = getEmailToEdit();
    this.isFocusEditorInput = this.emailToEdit
      ? this.emailToEdit.type === 'reply'
        ? true
        : false
      : false;
    this.state = {
      bccEmails: [],
      ccEmails: [],
      displayNonCriptextPopup: false,
      files: [],
      htmlBody: '',
      isCollapsedMoreRecipient: true,
      isDragActive: false,
      iv: null,
      key: null,
      newHtmlBody: '',
      nonCriptextRecipientsPassword: '',
      nonCriptextRecipientsVerified: false,
      status: Status.DISABLED,
      textSubject: '',
      threadId: null,
      toEmails: [],
      isLinkingDevices: false
    };

    addEvent(Event.DISABLE_WINDOW, () => {
      this.setState({
        isLinkingDevices: true
      });
    });

    addEvent(Event.ENABLE_WINDOW, () => {
      this.setState({
        isLinkingDevices: false
      });
    });
  }

  render() {
    return (
      <Composer
        {...this.props}
        bccEmails={this.state.bccEmails}
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
        isFocusEditorInput={this.isFocusEditorInput}
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
        isLinkingDevices={this.state.isLinkingDevices}
      />
    );
  }

  async componentDidMount() {
    let state;
    if (this.emailToEdit) {
      const composerData = await this.getComposerDataByType(this.emailToEdit);
      state = {
        ...composerData,
        status: Status.ENABLED
      };
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

  componentWillUnmount() {
    removeEvent(Event.DISABLE_WINDOW, () => {
      this.setState({
        isLinkingDevices: true
      });
    });

    removeEvent(Event.ENABLE_WINDOW, () => {
      this.setState({
        isLinkingDevices: false
      });
    });
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
    closeComposerWindow({});
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

  handleGetHtmlBody = newHtmlBody => {
    this.setState({ newHtmlBody }, () => this.saveTemporalDraft());
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
    if (this.state.files.length + newFiles.length > MAX_ATTACMENTS_AMOUNT) {
      return throwError(errors.message.TOO_MANY_FILES);
    } else if (newFiles && newFiles.length > 0) {
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
    const hasNonCriptextRecipients = !!this.checkNonCriptextRecipients();
    const isVerified = this.state.nonCriptextRecipientsVerified;
    const recipientsAmount =
      this.state.toEmails.length +
      this.state.ccEmails.length +
      this.state.bccEmails.length;
    if (hasNonCriptextRecipients && !isVerified) {
      this.setState({ displayNonCriptextPopup: true });
    } else if (recipientsAmount >= MAX_RECIPIENTS_AMOUNT) {
      this.setState({ status: Status.DISABLED }, () => {
        throwError(errors.message.TOO_MANY_RECIPIENTS);
      });
    } else {
      const isEmailSecure = hasNonCriptextRecipients
        ? !!this.state.nonCriptextRecipientsPassword
        : !hasNonCriptextRecipients;
      this.sendMessage(isEmailSecure);
    }
  };

  sendMessage = async secure => {
    this.setState({ status: Status.WAITING });
    const data = {
      bccEmails: this.state.bccEmails,
      body: this.state.newHtmlBody,
      ccEmails: this.state.ccEmails,
      files: this.state.files,
      iv: this.state.iv,
      key: this.state.key,
      labelId: LabelType.sent.id,
      secure,
      status: EmailStatus.SENDING,
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
      closeComposerWindow({ threadId, emailId });
    } catch (e) {
      if (e.message.includes('SQLITE_CONSTRAINT')) {
        // To remove
        await deleteEmailsByIds([emailId]);
        const email = await getEmailByKey(key);
        const emailLabels = [
          { emailId: email[0].id, labelId: LabelType.sent.id }
        ];
        await createEmailLabel(emailLabels);
        closeComposerWindow({});
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
      body: this.state.newHtmlBody,
      ccEmails: this.state.ccEmails,
      files: this.state.files,
      iv: this.state.iv,
      key: this.state.key,
      labelId: LabelType.draft.id,
      secure: false,
      textSubject: this.state.textSubject,
      toEmails: this.state.toEmails,
      threadId: this.state.threadId,
      status: EmailStatus.NONE
    };
    const { emailData } = EmailUtils.formOutgoingEmailFromData(data);
    saveDraftChanges(emailData);
  };
}

export default ComposerWrapper;
