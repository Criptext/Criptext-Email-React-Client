import React, { Component } from 'react';
import Composer from './../components/Composer';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { removeCriptextDomain, removeHTMLTags } from '../utils/StringUtils';
import { createEmail, updateEmail } from './../utils/electronInterface';
import { closeComposerWindow } from '../utils/electronInterface';
import signal from '../libs/signal';

class ComposerWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toEmails: [],
      ccEmails: [],
      bccEmails: [],
      htmlBody: EditorState.createEmpty(),
      textSubject: '',
      isSendButtonDisabled: true,
      isLoadingSendButton: false
    };
  }

  render() {
    return (
      <Composer
        {...this.props}
        ccEmails={this.state.ccEmails}
        bccEmails={this.state.bccEmails}
        isSendButtonDisabled={this.state.isSendButtonDisabled}
        isLoadingSendButton={this.state.isLoadingSendButton}
        htmlBody={this.state.htmlBody}
        toEmails={this.state.toEmails}
        getBccEmails={this.handleGetBccEmail}
        getCcEmails={this.handleGetCcEmail}
        getTextSubject={this.handleGetSubject}
        getToEmails={this.handleGetToEmail}
        onClickSendMessage={this.handleSendMessage}
        textSubject={this.state.textSubject}
        getHtmlBody={this.handleGetHtmlBody}
      />
    );
  }

  handleGetToEmail = emails => {
    const disabled = this.hasRecipients(
      emails,
      this.state.ccEmails,
      this.state.bccEmails
    );
    this.setState({ toEmails: emails, isSendButtonDisabled: disabled });
  };

  handleGetCcEmail = emails => {
    const disabled = this.hasRecipients(
      this.state.toEmails,
      emails,
      this.state.bccEmails
    );
    this.setState({ ccEmails: emails, isSendButtonDisabled: disabled });
  };

  handleGetBccEmail = emails => {
    const disabled = this.hasRecipients(
      this.state.toEmails,
      this.state.ccEmails,
      emails
    );
    this.setState({ bccEmails: emails, isSendButtonDisabled: disabled });
  };

  hasRecipients = (to, cc, bcc) => {
    return to.length || cc.length || bcc.length ? false : true;
  };

  handleGetSubject = text => {
    this.setState({ textSubject: text });
  };

  handleGetHtmlBody = html => {
    this.setState({ htmlBody: html });
  };

  handleSendMessage = async () => {
    this.setState({ isLoadingSendButton: true });
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
      threadId: 1,
      key: Date.now(),
      s3Key: Date.now(),
      subject,
      content: body,
      preview: removeHTMLTags(body).slice(0, 20),
      date: Date.now(),
      delivered: 0,
      unread: false,
      secure: true,
      isTrash: false,
      isDraft: true,
      isMuted: false
    };

    try {
      const emailResponse = await createEmail(email);
      const emailId = emailResponse[0];
      const res = await signal.encryptPostEmail(subject, to, body);
      if (res.status !== 200) {
        throw new Error('Error to encryption, try again');
      }
      const params = {
        id: emailId,
        isDraft: false
      };
      await updateEmail(params);
      closeComposerWindow();
    } catch (e) {
      this.setState({ isLoadingSendButton: false });
      alert(e);
    }
  };

  formRecipients = recipients => {
    let result = [];
    for (const key in recipients) {
      const recipient = recipients[key];
      result = recipient.reduce((array, email) => {
        if (email.indexOf('@criptext.com') > 0) {
          array.push({
            recipientId: removeCriptextDomain(email),
            deviceId: 1,
            type: key
          });
        }
        return array;
      }, result);
    }
    return result;
  };
}

export default ComposerWrapper;
