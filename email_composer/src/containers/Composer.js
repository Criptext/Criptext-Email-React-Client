/*eslint no-lone-blocks: 0*/
import React, { Component } from 'react';
import Composer from './../components/Composer';
import { Status } from './../components/Control';
import {
  LabelType,
  myAccount,
  loggedAccounts,
  getEmailToEdit,
  sendEventToMailbox,
  setMyAccount
} from './../utils/electronInterface';
import {
  closeComposerWindow,
  createEmail,
  isCriptextDomain,
  saveDraftChangesComposerWindow,
  throwError,
  checkExpiredSession
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
const EXPIRED_SESSION_STATUS = 401;
const PENDING_ATTACHMENTS_MODES = [FILE_MODES.UPLOADING, FILE_MODES.FAILED];
const temporalCheckedDomaind = {
  is: [],
  not: []
};

class ComposerWrapper extends Component {
  constructor(props) {
    super(props);
    this.emailToEdit = getEmailToEdit();
    this.focusInput = this.defineFocusInput(this.emailToEdit);
    this.signature = null;
    this.state = {
      accounts: loggedAccounts,
      accountSelected: myAccount,
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
      status: Status.INITIALIZING,
      textSubject: '',
      threadId: null,
      toEmails: [],
      isLinkingDevices: false,
      totalFilesSize: 0,
      allowChangeFrom: true
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
        isFocusEditorInput={this.focusInput.isFocusEditorInput}
        isFocusRecipientInput={this.focusInput.isFocusRecipientInput}
        isFocusSubjectInput={this.focusInput.isFocusSubjectInput}
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
        tagBlured={this.handleTagBlured}
        tagChanged={this.handleTagChanged}
        tagUpdated={this.handleTagUpdated}
        textSubject={this.state.textSubject}
        toEmails={this.state.toEmails}
        isLinkingDevices={this.state.isLinkingDevices}
        allowChangeFrom={this.state.allowChangeFrom}
      />
    );
  }

  async componentDidMount() {
    let state;
    if (this.emailToEdit) {
      const composerData = await this.getComposerDataByType(this.emailToEdit);
      const composerDataChecked = await this.checkContactDomains(composerData);
      state = {
        ...composerDataChecked,
        status: composerData.status || Status.ENABLED,
        allowChangeFrom: this.emailToEdit.type !== composerEvents.EDIT_DRAFT
      };
    } else {
      const composerData = await this.getDefaultComposerWithSignature();
      this.signature = composerData.htmlBody;
      state = { ...composerData, status: Status.DISABLED };
    }
    fileManager.on(FILE_PROGRESS, this.handleUploadProgress);
    fileManager.on(FILE_FINISH, this.handleUploadSuccess);
    fileManager.on(FILE_ERROR, this.handleUploadError);
    setCryptoInterfaces(filetoken => {
      return this.state.files.filter(file => file.token === filetoken)[0];
    });
    this.setState(state);
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

  checkContactDomains = async data => {
    const emails = data.toEmails
      .concat(data.ccEmails)
      .concat(data.bccEmails)
      .filter(contact => contact);
    const domains = emails.reduce((array, contact) => {
      const { contact: contactToCheck, domain } = parseEmailAddress(
        contact.email
      );
      if (contactToCheck.state) {
        array.push(domain);
      }
      return array;
    }, []);

    if (!domains.length) return data;
    const res = await isCriptextDomain(domains);
    if (res.status !== 200) return data;

    res.body.forEach(({ name, isCriptextDomain }) => {
      if (isCriptextDomain) {
        temporalCheckedDomaind.is.push(name);
      } else {
        temporalCheckedDomaind.not.push(name);
      }
    });

    const toEmails = !data.toEmails
      ? []
      : data.toEmails.map(contact => {
          const { domain } = parseEmailAddress(contact.email);
          if (temporalCheckedDomaind.is.includes(domain)) {
            return {
              ...contact,
              form: 'tag-app-domain'
            };
          }
          return contact;
        });
    const bccEmails = !data.bccEmails
      ? []
      : data.bccEmails.map(contact => {
          const { domain } = parseEmailAddress(contact.email);
          if (temporalCheckedDomaind.is.includes(domain)) {
            return {
              ...contact,
              form: 'tag-app-domain'
            };
          }
          return contact;
        });
    const ccEmails = !data.ccEmails
      ? []
      : data.ccEmails.map(contact => {
          const { domain } = parseEmailAddress(contact.email);
          if (temporalCheckedDomaind.is.includes(domain)) {
            return {
              ...contact,
              form: 'tag-app-domain'
            };
          }
          return contact;
        });

    return {
      ...data,
      toEmails,
      ccEmails,
      bccEmails
    };
  };

  checkContactDomain = async (stateKey, contactToCheck, domainToCheck) => {
    const isDomainCheckedBefore = temporalCheckedDomaind.is.includes(
      domainToCheck
    );
    const isNotDomainCheckedBefore = temporalCheckedDomaind.not.includes(
      domainToCheck
    );

    let isUserEnterprise = false;
    if (!isDomainCheckedBefore && !isNotDomainCheckedBefore) {
      const res = await isCriptextDomain([domainToCheck]);
      isUserEnterprise = res.body[0].isCriptextDomain;
      if (isUserEnterprise) {
        temporalCheckedDomaind.is.push(domainToCheck);
      } else {
        temporalCheckedDomaind.not.push(domainToCheck);
      }
    } else if (isDomainCheckedBefore) {
      isUserEnterprise = true;
    }
    const index = this.state[stateKey].findIndex(item => {
      return item.email === contactToCheck.email;
    });
    const indexItem = index === -1 ? this.state[stateKey].length : index;
    this.setState(state => {
      const emails = [...state[stateKey]];
      const contact = state[stateKey][indexItem];
      const contactChecked = {
        ...contact,
        state: undefined,
        form: isUserEnterprise ? 'tag-app-domain' : contact.form
      };
      emails.splice(indexItem, 1, contactChecked);
      return {
        [stateKey]: emails
      };
    });
  };

  defineFocusInput = emailToEdit => {
    let isFocusRecipientInput = false,
      isFocusSubjectInput = false,
      isFocusEditorInput = false;
    if (emailToEdit) {
      if (emailToEdit.type === 'reply' || emailToEdit.type === 'reply-all') {
        isFocusEditorInput = true;
      } else if (emailToEdit.type === 'new-with-data') {
        if (!emailToEdit.data.recipients) {
          isFocusRecipientInput = true;
        } else if (
          emailToEdit.data.recipients &&
          !emailToEdit.data.email.subject
        ) {
          isFocusSubjectInput = true;
        } else if (
          emailToEdit.data.recipients &&
          emailToEdit.data.email.subject
        ) {
          isFocusEditorInput = true;
        }
      }
    }
    if (!isFocusRecipientInput) {
      isFocusRecipientInput = !isFocusEditorInput && !isFocusSubjectInput;
    }
    return { isFocusRecipientInput, isFocusSubjectInput, isFocusEditorInput };
  };

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
    const threadId = this.state.threadId;
    closeComposerWindow({ threadId, discard: true });
  };

  handleDisableSendButtonOnInvalidEmail = () => {
    this.setState(prevState => {
      if (prevState.status !== Status.DISABLED) {
        return { status: Status.DISABLED };
      }
    });
  };

  hangleGetAccount = account => {
    setMyAccount(account.recipientId);
    this.setState({ accountSelected: account });
  };

  handleGetToEmail = async emails => {
    let parsedEmails = [];
    let contactToCheck = {};
    let domainToCheck;
    if (emails.length > this.state.toEmails.length) {
      const { contact, domain } = parseEmailAddress(emails[emails.length - 1]);
      contactToCheck = contact;
      domainToCheck = domain;
      parsedEmails = [...this.state.toEmails, contact];
    } else {
      parsedEmails = emails;
    }
    const status = this.checkEmptyRecipientsAndGetSendButtonStatus(
      parsedEmails,
      this.state.ccEmails,
      this.state.bccEmails
    );
    this.setState({ toEmails: parsedEmails, status }, () =>
      this.saveTemporalDraft()
    );
    if (contactToCheck.state) {
      await this.checkContactDomain('toEmails', contactToCheck, domainToCheck);
    }
  };

  handleGetCcEmail = async emails => {
    let parsedEmails = [];
    let contactToCheck = {};
    let domainToCheck;
    if (emails.length > this.state.ccEmails.length) {
      const { contact, domain } = parseEmailAddress(emails[emails.length - 1]);
      contactToCheck = contact;
      domainToCheck = domain;
      parsedEmails = [...this.state.ccEmails, contact];
    } else {
      parsedEmails = emails;
    }
    const status = this.checkEmptyRecipientsAndGetSendButtonStatus(
      this.state.toEmails,
      parsedEmails,
      this.state.bccEmails
    );
    this.setState({ ccEmails: parsedEmails, status }, () =>
      this.saveTemporalDraft()
    );
    if (contactToCheck.state) {
      await this.checkContactDomain('ccEmails', contactToCheck, domainToCheck);
    }
  };

  handleGetBccEmail = async emails => {
    let parsedEmails = [];
    let contactToCheck = {};
    let domainToCheck;
    if (emails.length > this.state.bccEmails.length) {
      const { contact, domain } = parseEmailAddress(emails[emails.length - 1]);
      contactToCheck = contact;
      domainToCheck = domain;
      parsedEmails = [...this.state.bccEmails, contact];
    } else {
      parsedEmails = emails;
    }
    const status = this.checkEmptyRecipientsAndGetSendButtonStatus(
      this.state.toEmails,
      this.state.ccEmails,
      parsedEmails
    );
    this.setState({ bccEmails: parsedEmails, status }, () =>
      this.saveTemporalDraft()
    );
    if (contactToCheck.state) {
      await this.checkContactDomain('bccEmails', contactToCheck, domainToCheck);
    }
  };

  checkEmptyRecipientsAndGetSendButtonStatus = (
    toEmails,
    ccEmails,
    bccEmails
  ) => {
    return areEmptyAllArrays(toEmails, ccEmails, bccEmails)
      ? Status.DISABLED
      : Status.ENABLED;
  };

  checkErrorRecipientsAndGetSendButtonStatus = contacts => {
    const index = contacts.findIndex(contact => {
      if (typeof contact === 'string') return false;
      return contact.form === 'tag-error';
    });
    const hasError = index >= 0;
    this.setState({ status: hasError ? Status.DISABLED : Status.ENABLED });
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

  handleClearInputAttachments = () => {
    try {
      const input = document.getElementById('input-attachments');
      if (input) input.value = '';
    } catch (fileInputErr) {
      // eslint-disable-next-line no-console
      console.error(fileInputErr);
    }
  };

  handleDrop = e => {
    e.preventDefault();
    this.setState({ isDragActive: false });
    const files = this.getFilesFromEvent(e);
    const filesFiltered = [...files].filter(item => item.type || item.size);
    if (filesFiltered.length) {
      this.setFiles(filesFiltered);
    }
    this.handleClearInputAttachments();
  };

  setFiles = newFiles => {
    const fileWithKey = this.state.files.filter(file => file.key && file.iv)[0];
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
        let uploadingFile;
        if (error) {
          this.handleUploadFileErrorStatus(error, firstNewFile);
        } else {
          uploadingFile = {
            token,
            key,
            iv,
            percentage: 0,
            fileData: firstNewFile,
            mode: FILE_MODES.UPLOADING
          };
        }
        this.setState(
          prevState => ({
            files: uploadingFile
              ? prevState.files.concat(uploadingFile)
              : prevState.files,
            totalFilesSize: prevState.totalFilesSize + firstNewFile.size
          }),
          () => {
            this.setFiles(remainingNewFiles);
          }
        );
      });
    }
  };

  handleUploadFileErrorStatus = async (error, file) => {
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
      // To check
      case EXPIRED_SESSION_STATUS: {
        return await checkExpiredSession({
          response: { status },
          initialRequest: fileManager.uploadFile,
          requestParams: file
        });
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
    const fileDeletedSize = this.state.files.find(file => file.token === token);
    const files = this.state.files.filter(file => file.token !== token);
    this.setState(
      prevState => ({
        files,
        totalFilesSize: prevState.totalFilesSize - fileDeletedSize.fileData.size
      }),
      () => {
        this.saveTemporalDraft();
      }
    );
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
    const recipientsAmount =
      this.state.toEmails.length +
      this.state.ccEmails.length +
      this.state.bccEmails.length;
    if (recipientsAmount >= MAX_RECIPIENTS_AMOUNT) {
      this.setState({ status: Status.DISABLED }, () => {
        throwError(string.errors.tooManyRecipients);
      });
    } else {
      const isEmailSecure = !hasNonCriptextRecipients;
      this.sendMessage(isEmailSecure);
    }
  };

  sendMessage = async secure => {
    this.setState({ status: Status.WAITING });

    const data = {
      bccEmails: this.state.bccEmails,
      body: this.state.newHtmlBody,
      ccEmails: this.state.ccEmails,
      isEnterprise: myAccount.recipientId.includes('@'),
      labelId: LabelType.sent.id,
      secure,
      status: EmailStatus.SENT,
      textSubject: this.state.textSubject,
      toEmails: this.state.toEmails,
      threadId: this.state.threadId || undefined
    };
    const {
      bodyWithSign,
      emailData,
      recipientDomains
    } = formOutgoingEmailFromData(data);
    const files = await getFileParamsToSend(this.state.files);

    const [username, domain] = myAccount.recipientId.split('@');
    const peer = {
      recipientId: myAccount.recipientId,
      username: username,
      domain: domain || appDomain,
      type: 'peer',
      deviceId: myAccount.deviceId
    };
    const recipients = [...recipientDomains, peer];
    const externalEmailPassword = this.state.nonCriptextRecipientsPassword;
    const params = {
      subject: emailData.email.subject,
      threadId: emailData.email.threadId,
      recipients,
      body: emailData.body,
      bodyWithSign,
      preview: emailData.email.preview,
      files,
      peer,
      externalEmailPassword
    };
    try {
      const res = await encryptPostEmail(params);
      const { metadataKey, date, messageId } = res.body;
      const threadId = res.body.threadId || this.state.threadId;

      const filesDbParams = formFileParamsToDatabase(files);
      if (filesDbParams.length) emailData['files'] = filesDbParams;

      const newEmail = {
        ...emailData.email,
        key: metadataKey,
        threadId,
        date,
        messageId
      };
      const newEmailData = { ...emailData, email: newEmail };
      const emailCreated = await createEmail(newEmailData);
      closeComposerWindow({
        threadId,
        emailId: emailCreated.id,
        hasExternalPassphrase: !!externalEmailPassword
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      if (e.code === 'ECONNREFUSED') {
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

  handleTagBlured = (type, key, value) => {
    switch (type) {
      case 'to':
        {
          let contactToCheck = {};
          let domainToCheck;
          this.setState(
            state => {
              const emails = [...state.toEmails];
              const { domain, contact } = parseEmailAddress(value);
              contactToCheck = contact;
              domainToCheck = domain;
              emails.splice(key, 1, contact);
              return {
                toEmails: emails
              };
            },
            async () => {
              if (contactToCheck.state) {
                await this.checkContactDomain(
                  'toEmails',
                  contactToCheck,
                  domainToCheck
                );
              }
              if (contactToCheck.form !== 'tag-error') {
                this.checkErrorRecipientsAndGetSendButtonStatus([
                  ...this.state.toEmails,
                  ...this.state.ccEmails,
                  ...this.state.bccEmails
                ]);
              }
            }
          );
        }
        break;
      case 'cc':
        {
          let contactToCheck = {};
          let domainToCheck;
          this.setState(
            state => {
              const emails = [...state.ccEmails];
              const { domain, contact } = parseEmailAddress(value);
              contactToCheck = contact;
              domainToCheck = domain;
              emails.splice(key, 1, contact);
              return {
                ccEmails: emails
              };
            },
            async () => {
              if (contactToCheck.state) {
                await this.checkContactDomain(
                  'ccEmails',
                  contactToCheck,
                  domainToCheck
                );
              }
              if (contactToCheck.form !== 'tag-error') {
                this.checkErrorRecipientsAndGetSendButtonStatus([
                  ...this.state.toEmails,
                  ...this.state.ccEmails,
                  ...this.state.bccEmails
                ]);
              }
            }
          );
        }
        break;
      case 'bcc':
        {
          let contactToCheck = {};
          let domainToCheck;
          this.setState(
            state => {
              const emails = [...state.bccEmails];
              const { domain, contact } = parseEmailAddress(value);
              contactToCheck = contact;
              domainToCheck = domain;
              emails.splice(key, 1, contact);
              return {
                bccEmails: emails
              };
            },
            async () => {
              if (contactToCheck.state) {
                await this.checkContactDomain(
                  'bccEmails',
                  contactToCheck,
                  domainToCheck
                );
              }
              if (contactToCheck.form !== 'tag-error') {
                this.checkErrorRecipientsAndGetSendButtonStatus([
                  ...this.state.toEmails,
                  ...this.state.ccEmails,
                  ...this.state.bccEmails
                ]);
              }
            }
          );
        }
        break;
      default:
        break;
    }
  };

  handleTagChanged = (type, key, value) => {
    switch (type) {
      case 'to':
        {
          this.setState(state => {
            const emails = [...state.toEmails];
            const contact = { ...emails[key], complete: value };
            emails.splice(key, 1, contact);
            return {
              toEmails: emails
            };
          });
        }
        break;
      case 'cc':
        {
          this.setState(state => {
            const emails = [...state.ccEmails];
            const contact = { ...emails[key], complete: value };
            emails.splice(key, 1, contact);
            return {
              ccEmails: emails
            };
          });
        }
        break;
      case 'bcc':
        {
          this.setState(state => {
            const emails = [...state.bccEmails];
            const contact = { ...emails[key], complete: value };
            emails.splice(key, 1, contact);
            return {
              bccEmails: emails
            };
          });
        }
        break;
      default:
        break;
    }
  };

  handleTagUpdated = (type, key) => {
    switch (type) {
      case 'to':
        {
          this.setState(state => {
            const emails = [...state.toEmails];
            emails.splice(key, 1, { ...emails[key], state: 'tag-expanded' });
            return {
              toEmails: emails
            };
          });
        }
        break;
      case 'cc':
        {
          this.setState(state => {
            const emails = [...state.ccEmails];
            emails.splice(key, 1, { ...emails[key], state: 'tag-expanded' });
            return {
              ccEmails: emails
            };
          });
        }
        break;
      case 'bcc':
        {
          this.setState(state => {
            const emails = [...state.bccEmails];
            emails.splice(key, 1, { ...emails[key], state: 'tag-expanded' });
            return {
              bccEmails: emails
            };
          });
        }
        break;
      default:
        break;
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
    const data = {
      bccEmails: this.state.bccEmails,
      body: this.state.newHtmlBody,
      ccEmails: this.state.ccEmails,
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
    const isEmpty = !(
      emailData.body !== this.signature ||
      emailData.recipients.to.length ||
      emailData.recipients.to.cc ||
      emailData.recipients.bcc.length ||
      emailData.email.subject
    );
    const dataDraft = isEmpty ? { isEmpty } : emailData;
    saveDraftChangesComposerWindow(dataDraft);
  };
}

export default ComposerWrapper;
