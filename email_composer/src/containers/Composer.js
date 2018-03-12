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
      disabledSendButton: true,
      displayLoadingSendButton: false
    };
  }

  render() {
    return (
      <Composer
        {...this.props}
        ccEmails={this.state.ccEmails}
        bccEmails={this.state.bccEmails}
        disabledSendButton={this.state.disabledSendButton}
        displayLoadingSendButton={this.state.displayLoadingSendButton}
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
    this.setState({ toEmails: emails });
    this.checkRecipients(emails, this.state.ccEmails, this.state.bccEmails);
  };

  handleGetCcEmail = emails => {
    this.setState({ ccEmails: emails });
    this.checkRecipients(this.state.toEmails, emails, this.state.bccEmails);
  };

  handleGetBccEmail = emails => {
    this.setState({ bccEmails: emails });
    this.checkRecipients(this.state.toEmails, this.state.ccEmails, emails);
  };

  checkRecipients = (to, cc, bcc) => {
    const value = to.length || cc.length || bcc.length ? false : true;
    this.setState({ disabledSendButton: value });
  };

  handleGetSubject = text => {
    this.setState({ textSubject: text });
  };

  handleGetHtmlBody = html => {
    this.setState({ htmlBody: html });
  };

  handleSendMessage = async () => {
    this.setState({ displayLoadingSendButton: true });
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
      this.setState({ displayLoadingSendButton: false });
      alert(e);
    }
  };

  formRecipients = recipients => {
    const result = [];
    for (const key in recipients) {
      if (recipients.hasOwnProperty(key)) {
        const recipient = recipients[key];
        recipient.forEach(email => {
          if (email.indexOf('@criptext.com') > 0) {
            result.push({
              recipientId: removeCriptextDomain(email),
              deviceId: 1,
              type: key
            });
          }
        });
      }
    }
    return result;
  };
}

export default ComposerWrapper;
