import React, { Component } from 'react';
import Composer from './../components/Composer';
import { Status } from './../components/Control';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { removeAppDomain, removeHTMLTags } from './../utils/StringUtils';
import {
  closeComposerWindow,
  createEmail,
  LabelType,
  myAccount,
  throwError,
  updateEmail,
  updateEmailLabel,
  saveDraftChanges
} from './../utils/electronInterface';
import { areEmptyAllArrays } from './../utils/ArrayUtils';
import signal from '../libs/signal';
import { appDomain } from './../utils/const';

class ComposerWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toEmails: [],
      ccEmails: [],
      bccEmails: [],
      htmlBody: EditorState.createEmpty(),
      textSubject: '',
      status: undefined
    };
  }

  render() {
    return (
      <Composer
        {...this.props}
        ccEmails={this.state.ccEmails}
        bccEmails={this.state.bccEmails}
        htmlBody={this.state.htmlBody}
        toEmails={this.state.toEmails}
        getBccEmails={this.handleGetBccEmail}
        getCcEmails={this.handleGetCcEmail}
        getTextSubject={this.handleGetSubject}
        getToEmails={this.handleGetToEmail}
        getHtmlBody={this.handleGetHtmlBody}
        onClickSendMessage={this.handleSendMessage}
        textSubject={this.state.textSubject}
        status={this.state.status}
      />
    );
  }

  handleGetToEmail = emails => {
    const status = areEmptyAllArrays(
      emails,
      this.state.ccEmails,
      this.state.bccEmails
    )
      ? undefined
      : Status.ENABLED;
    this.setState({ toEmails: emails, status }, () => this.saveTemporalState());
  };

  handleGetCcEmail = emails => {
    const status = areEmptyAllArrays(
      this.state.toEmails,
      emails,
      this.state.bccEmails
    )
      ? undefined
      : Status.ENABLED;
    this.setState({ ccEmails: emails, status }, () => this.saveTemporalState());
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
      this.saveTemporalState()
    );
  };

  handleGetSubject = text => {
    this.setState({ textSubject: text }, () => this.saveTemporalState());
  };

  handleGetHtmlBody = htmlBody => {
    this.setState({ htmlBody }, () => this.saveTemporalState());
  };

  handleSendMessage = async () => {
    this.setState({ status: Status.WAITING });
    const recipients = {
      to: this.state.toEmails,
      cc: this.state.ccEmails,
      bcc: this.state.bccEmails
    };
    const to = this.formRecipients(recipients);
    const subject = this.state.textSubject;
    const body = draftToHtml(
      convertToRaw(this.state.htmlBody.getCurrentContent())
    );
    const email = {
      key: Date.now(),
      subject,
      content: body,
      preview: removeHTMLTags(body).slice(0, 20),
      date: Date.now(),
      delivered: 0,
      unread: false,
      secure: true,
      isMuted: false
    };
    const from = myAccount.recipientId;
    recipients.from = [`${from}@${appDomain}`];

    const data = {
      email,
      recipients,
      labels: [LabelType.draft.id]
    };
    try {
      const [emailId] = await createEmail(data);
      const res = await signal.encryptPostEmail(subject, to, body);
      const { metadataKey, threadId, date } = res.body;
      const emailParams = { id: emailId, key: metadataKey, threadId, date };
      await updateEmail(emailParams);
      const emailLabelParams = {
        emailId,
        oldLabelId: LabelType.draft.id,
        newLabelId: LabelType.sent.id
      };
      await updateEmailLabel(emailLabelParams);
      closeComposerWindow();
    } catch (e) {
      this.setState({ status: Status.ENABLED });
      const errorToShow = {
        name: e.name,
        description: e.message
      };
      throwError(errorToShow);
    }
  };

  formRecipients = recipients => {
    return [
      ...this.getCriptextRecipients(recipients.to, 'to'),
      ...this.getCriptextRecipients(recipients.cc, 'cc'),
      ...this.getCriptextRecipients(recipients.bcc, 'bcc')
    ];
  };

  getCriptextRecipients = (recipients, type) =>
    recipients
      .filter(email => email.indexOf(`@${appDomain}`) > 0)
      .map(email => ({
        recipientId: removeAppDomain(email),
        deviceId: 1,
        type
      }));

  saveTemporalState = () => {
    const recipients = {
      to: this.state.toEmails,
      cc: this.state.ccEmails,
      bcc: this.state.bccEmails
    };
    const subject = this.state.textSubject;
    const body = draftToHtml(
      convertToRaw(this.state.htmlBody.getCurrentContent())
    );
    const email = {
      key: Date.now(),
      subject,
      content: body,
      preview: removeHTMLTags(body).slice(0, 21),
      date: Date.now(),
      delivered: 0,
      unread: false,
      secure: true,
      isMuted: false
    };
    const from = myAccount.recipientId;
    recipients.from = [`${from}@${appDomain}`];
    const data = {
      email,
      recipients,
      labels: [LabelType.draft.id]
    };
    alert(recipients);
    saveDraftChanges(data);
  };
}

export default ComposerWrapper;
