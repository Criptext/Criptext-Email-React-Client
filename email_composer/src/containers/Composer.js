import React, { Component } from 'react';
import Composer from './../components/Composer';
import { Status } from './../components/Control';
import {
  LabelType,
  myAccount,
  getEmailToEdit,
  sendEventToMailbox
} from './../utils/electronInterface';
import {
  closeComposerWindow,
  createEmail,
  createEmailLabel,
  deleteEmailsByIds,
  getAccountByParams,
  getEmailByKey,
  saveDraftChangesComposerWindow,
  saveEmailBody,
  throwError,
  updateEmail
} from './../utils/ipc';
import {
  areEmptyAllArrays,
  updateObjectFieldsInArray
} from './../utils/ArrayUtils';
import { encryptPostEmail } from './../libs/signal';
import {
  EmailStatus,
  formDataToEditDraft,
  formDataToReply,
  formComposerDataWithSignature,
  formNewEmailFromData,
  formOutgoingEmailFromData,
  parseEmailAddress
} from './../utils/EmailUtils';
import {
  CHUNK_SIZE,
  FILE_ERROR,
  FILE_FINISH,
  FILE_MODES,
  FILE_PROGRESS,
  fileManager,
  formFileParamsToDatabase,
  getFileParamsToSend,
  setCryptoInterfaces
} from './../utils/FileUtils';
import string from './../lang';
import {
  appDomain,
  composerEvents,
  defaultEmptyMimetypeValue
} from '../utils/const';
import { generateKeyAndIv } from '../utils/AESUtils';
import { addEvent, removeEvent, Event } from '../utils/electronEventInterface';
import { convertToHumanSize } from './../utils/StringUtils';

const MAX_RECIPIENTS_AMOUNT = 300;
const MAX_ATTACMENTS_TOTAL_SIZE = 25 * 1000 * 1000;
const TOO_BIG_FILE_STATUS = 413;
const PENDING_ATTACHMENTS_MODES = [FILE_MODES.UPLOADING, FILE_MODES.FAILED];

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
      accounts: [],
      accountSelected: {},
      bccEmails: [],
      ccEmails: [],
      displayNonCriptextPopup: false,
      files: [],
      htmlBody: '',
      isCollapsedMoreRecipient: true,
      isDragActive: false,
      newHtmlBody: '',
      nonCriptextRecipientsPassword: '',
      nonCriptextRecipientsVerified: false,
      status: Status.DISABLED,
      textSubject: '',
      threadId: null,
      toEmails: [],
      isLinkingDevices: false,
      totalFilesSize: 0
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
        accounts={this.state.accounts}
        accountSelected={this.state.accountSelected}
        bccEmails={this.state.bccEmails}
        ccEmails={this.state.ccEmails}
        disableSendButtonOnInvalidEmail={
          this.handleDisableSendButtonOnInvalidEmail
        }
        displayNonCriptextPopup={this.state.displayNonCriptextPopup}
        files={this.state.files}
        getAccount={this.hangleGetAccount}
        getBccEmails={this.handleGetBccEmail}
        getCcEmails={this.handleGetCcEmail}
        getTextSubject={this.handleGetSubject}
        getToEmails={this.handleGetToEmail}
        getHtmlBody={this.handleGetHtmlBody}
        htmlBody={this.state.htmlBody}
        isCollapsedMoreRecipient={this.state.isCollapsedMoreRecipient}
        isDragActive={this.state.isDragActive}
        isFocusEditorInput={this.isFocusEditorInput}
        onClearFile={this.handleClearFile}
        onClickCancelSendMessage={this.handleClickCancelSendMessage}
        onClickDiscardDraft={this.handleClickDiscardDraft}
        onClickSendMessage={this.handleSendMessage}
        onDragLeave={this.handleDragLeave}
        onDragOver={this.handleDragOver}
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
        status: composerData.status || Status.ENABLED
      };
    } else {
      const composerData = await this.getDefaultComposerWithSignature();
      const status = myAccount.signatureEnabled
        ? Status.ENABLED
        : Status.DISABLED;
      state = { ...composerData, status };
    }
    fileManager.on(FILE_PROGRESS, this.handleUploadProgress);
    fileManager.on(FILE_FINISH, this.handleUploadSuccess);
    fileManager.on(FILE_ERROR, this.handleUploadError);
    setCryptoInterfaces(filetoken => {
      return this.state.files.filter(file => file.token === filetoken)[0];
    });
    const { accounts, accountSelected } = await this.getLoggedAccounts();
    state = {
      ...state,
      accounts,
      accountSelected
    };
    myAccount.update({ other: accountSelected });
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

  getLoggedAccounts = async () => {
    try {
      const res = await getAccountByParams({
        isLoggedIn: true
      });
      const accounts = [];
      let accountSelected = {};
      res.forEach(account => {
        const item = {
          id: account.id,
          emailAddress: `${account.recipientId}@${appDomain}`,
          recipientId: account.recipientId,
          deviceId: account.deviceId
        };
        accounts.push(item);
        if (account.isActive) {
          accountSelected = item;
        }
      });
      return { accounts, accountSelected };
    } catch (e) {
      return { accounts: [], accountSelected: {} };
    }
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

  hangleGetAccount = account => {
    myAccount.update({ other: account });
    this.setState({ accountSelected: account });
  };

  handleGetToEmail = emails => {
    const parsedEmails = emails.map(item => parseEmailAddress(item));
    const status = this.checkAndGetSendButtonStatus(
      parsedEmails,
      this.state.ccEmails,
      this.state.bccEmails
    );
    this.setState({ toEmails: parsedEmails, status }, () =>
      this.saveTemporalDraft()
    );
  };

  handleGetCcEmail = emails => {
    const parsedEmails = emails.map(item => parseEmailAddress(item));
    const status = this.checkAndGetSendButtonStatus(
      this.state.toEmails,
      parsedEmails,
      this.state.bccEmails
    );
    this.setState({ ccEmails: parsedEmails, status }, () =>
      this.saveTemporalDraft()
    );
  };

  handleGetBccEmail = emails => {
    const parsedEmails = emails.map(item => parseEmailAddress(item));
    const status = this.checkAndGetSendButtonStatus(
      this.state.toEmails,
      this.state.ccEmails,
      parsedEmails
    );
    this.setState({ bccEmails: parsedEmails, status }, () =>
      this.saveTemporalDraft()
    );
  };

  checkAndGetSendButtonStatus = (toEmails, ccEmails, bccEmails) => {
    return areEmptyAllArrays(toEmails, ccEmails, bccEmails)
      ? Status.DISABLED
      : Status.ENABLED;
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
    const files = [...this.state.files];
    const fileWithKey = files.filter(file => file.key && file.iv)[0];
    let iv, key;
    if (fileWithKey) {
      key = fileWithKey.key;
      iv = fileWithKey.iv;
    } else {
      const keyAndIv = generateKeyAndIv(null, null);
      key = keyAndIv.key;
      iv = keyAndIv.iv;
    }
    if (newFiles && newFiles.length > 0) {
      const [firstNewFile, ...remainingNewFiles] = Array.from(newFiles);

      if (
        this.state.totalFilesSize + firstNewFile.size >
        MAX_ATTACMENTS_TOTAL_SIZE
      ) {
        setTimeout(() => {
          const { name, description } = string.errors.attachmentsTotalSize;
          throwError({
            name,
            description:
              description.prefix +
              convertToHumanSize(MAX_ATTACMENTS_TOTAL_SIZE, true, 0) +
              description.suffix
          });
        }, 1500);
        return;
      }

      fileManager.uploadFile(firstNewFile, CHUNK_SIZE, (error, token) => {
        if (error) {
          this.handleUploadFileErrorStatus(error, firstNewFile);
        } else {
          const uploadingFile = {
            token,
            key,
            iv,
            percentage: 0,
            fileData: firstNewFile,
            mode: FILE_MODES.UPLOADING
          };
          files.push(uploadingFile);
        }
        this.setState(
          prevState => ({
            files,
            totalFilesSize: prevState.totalFilesSize + firstNewFile.size
          }),
          () => {
            this.setFiles(remainingNewFiles);
          }
        );
      });
    }
  };

  handleUploadFileErrorStatus = (error, file) => {
    const { status } = error;
    switch (status) {
      case TOO_BIG_FILE_STATUS: {
        const {
          prefix,
          suffix,
          defaultEnd
        } = string.errors.tooBigFile.description;
        throwError({
          name: string.errors.tooBigFile.name,
          description: `${prefix} ${file.name} ${suffix}${
            error.maxSize
              ? ` ${convertToHumanSize(Number(error.maxSize), true)}`
              : `${defaultEnd}`
          }`
        });
        return;
      }
      default:
        return throwError(string.errors.uploadFailed);
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
    this.setState({ files }, this.saveTemporalDraft);
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
    const files = this.state.files.filter(file => file.token !== token);
    this.setState({ files }, this.saveTemporalDraft);
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
    const hasPendingAttachments = this.state.files.filter(file =>
      PENDING_ATTACHMENTS_MODES.includes(file.mode)
    );
    if (hasPendingAttachments.length) {
      throwError(string.errors.pendingFiles);
      return;
    }
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
        throwError(string.errors.tooManyRecipients);
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
    const temporalThreadId = `<criptext-temp-${Date.now()}>`;
    const account = this.state.accountSelected;
    const accountId = account.id;
    const data = {
      account,
      bccEmails: this.state.bccEmails,
      body: this.state.newHtmlBody,
      ccEmails: this.state.ccEmails,
      labelId: LabelType.sent.id,
      secure,
      status: EmailStatus.SENDING,
      textSubject: this.state.textSubject,
      toEmails: this.state.toEmails,
      threadId: this.state.threadId || temporalThreadId
    };
    const {
      emailData,
      criptextRecipients,
      externalRecipients
    } = formOutgoingEmailFromData(data);
    let emailId, key;
    try {
      const files = await getFileParamsToSend(this.state.files);
      const filesDbParams = formFileParamsToDatabase(files);
      if (filesDbParams.length) {
        emailData['files'] = filesDbParams;
      }

      [emailId] = await createEmail(emailData);
      const peer = {
        recipientId: account.recipientId,
        type: 'peer',
        deviceId: account.deviceId
      };
      const recipients = [...criptextRecipients, peer];
      const externalEmailPassword = this.state.nonCriptextRecipientsPassword;
      const params = {
        subject: emailData.email.subject,
        threadId: emailData.email.threadId,
        recipients,
        externalRecipients,
        body: emailData.body,
        preview: emailData.email.preview,
        files,
        peer,
        externalEmailPassword
      };
      const res = await encryptPostEmail(params);

      const { metadataKey, date, messageId } = res.body;
      const threadId = this.state.threadId || res.body.threadId;
      key = metadataKey;
      const emailParams = {
        accountId,
        id: emailId,
        key,
        threadId,
        date,
        status: EmailStatus.SENT,
        messageId
      };
      await updateEmail(emailParams);
      await saveEmailBody({
        body: data.body,
        metadataKey: metadataKey,
        replaceKey: emailData.email.key
      });
      closeComposerWindow({
        threadId,
        emailId,
        hasExternalPassphrase: !!externalEmailPassword
      });
    } catch (e) {
      if (e.message && e.message.includes('SQLITE_CONSTRAINT')) {
        // To remove
        await deleteEmailsByIds([emailId]);
        const email = await getEmailByKey(key);
        const emailLabels = [
          { emailId: email[0].id, labelId: LabelType.sent.id }
        ];
        await createEmailLabel(emailLabels);
        closeComposerWindow({});
      } else if (e.code === 'ECONNREFUSED') {
        throwError(string.errors.unableToConnect);
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
    const parseDraftFiles = files => {
      return files.map(file => {
        const fileParams = {
          token: file.token,
          name: file.fileData.name,
          size: file.fileData.size,
          mimeType: file.fileData.type || defaultEmptyMimetypeValue,
          key: file.key,
          iv: file.iv,
          date: Date.now(),
          status: 1
        };
        if (file.fileData.cid) fileParams['cid'] = file.fileData.cid;
        return fileParams;
      });
    };
    const account = this.state.accountSelected;
    const data = {
      account,
      bccEmails: this.state.bccEmails,
      body: this.state.newHtmlBody,
      ccEmails: this.state.ccEmails,
      isDraft: true,
      labelId: LabelType.draft.id,
      secure: false,
      textSubject: this.state.textSubject,
      toEmails: this.state.toEmails,
      threadId: this.state.threadId,
      status: EmailStatus.NONE
    };
    if (this.state.files.length) {
      data['files'] = parseDraftFiles(this.state.files);
    }
    const { emailData } = formOutgoingEmailFromData(data);
    saveDraftChangesComposerWindow(emailData);
  };
}

export default ComposerWrapper;
