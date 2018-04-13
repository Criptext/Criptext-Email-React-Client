import React, { Component } from 'react';
import Composer from './../components/Composer';
import { Status } from './../components/Control';
import { EditorState } from 'draft-js';
import {
  closeComposerWindow,
  createEmail,
  LabelType,
  throwError,
  updateEmail,
  updateEmailLabel,
  saveDraftChanges
} from './../utils/electronInterface';
import { areEmptyAllArrays } from './../utils/ArrayUtils';
import signal from './../libs/signal';
import { formOutgoingEmailFromData } from './../utils/EmailUtils';

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

  handleSendMessage = async () => {
    this.setState({ status: Status.WAITING });
    const { data, to, subject, body } = formOutgoingEmailFromData(
      this.state,
      LabelType.draft.id
    );
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

  saveTemporalDraft = () => {
    const { data } = formOutgoingEmailFromData(this.state, LabelType.draft.id);
    saveDraftChanges(data);
  };
}

export default ComposerWrapper;
