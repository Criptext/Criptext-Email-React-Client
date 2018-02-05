import React, { Component } from 'react';
import Composer from './Composer';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

class ComposerWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toEmails: [],
      ccEmails: [],
      bccEmails: [],
      htmlBody: EditorState.createEmpty(),
      textSubject: ''
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
        onClickSendMessage={this.handleSendMessage}
        textSubject={this.textSubject}
        getHtmlBody={this.handleGetHtmlBody}
      />
    );
  }

  handleSendMessage = () => {
    /*eslint-disable */
    const body = {
      subject: this.state.textSubject,
      recipientId: 'gaumala',
      guestEmail: {
        to: this.state.toEmails,
        cc: this.state.ccEmails,
        bcc: this.state.bccEmails,
        body: draftToHtml(
          convertToRaw(this.state.htmlBody.getCurrentContent())
        ),
        session: null
      }
    };
    /*eslint-enable */
  };

  handleGetToEmail = emails => {
    this.setState({ toEmails: emails });
  };

  handleGetCcEmail = emails => {
    this.setState({ ccEmails: emails });
  };

  handleGetBccEmail = emails => {
    this.setState({ bccEmails: emails });
  };

  handleGetSubject = text => {
    this.setState({ textSubject: text });
  };

  handleGetHtmlBody = html => {
    this.setState({ htmlBody: html });
  };
}

export default ComposerWrapper;
