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
  throwError,
  updateEmail,
  updateEmailLabel,
  saveDraftChanges,
  errors,
  deleteEmailById,
  getEmailByKey,
  createEmailLabel,
  getEmailToEdit
} from './../utils/electronInterface';
import { areEmptyAllArrays } from './../utils/ArrayUtils';
import signal from './../libs/signal';
import {
  formOutgoingEmailFromData,
  formDataToEditDraft,
  formDataToReply
} from './../utils/EmailUtils';
import { Map } from 'immutable';

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
      toEmails: [],
      ccEmails: [],
      bccEmails: [],
      htmlBody: EditorState.createEmpty(),
      textSubject: '',
      status: undefined,
      threadId: undefined,
      isDragActive: false,
      files: []
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
        blockRenderMap={blockRenderMap}
        files={this.state.files}
        isDragActive={this.state.isDragActive}
        onClearFile={this.handleClearFile}
        onDrop={this.handleDrop}
        handleDragLeave={this.handleDragLeave}
        handleDragOver={this.handleDragOver}
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
  }

  getComposerDataByType = async (key, type) => {
    if (type === composerEvents.EDIT_DRAFT) {
      return await formDataToEditDraft(key);
    }
    return await formDataToReply(key, type);
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
      const files = [...this.state.files, firstNewFile];
      this.setState({ files }, () => {
        this.setFiles(remainingNewFiles);
      });
    }
  };

  handleClearFile = filename => {
    const files = this.state.files.filter(file => {
      return file.name !== filename;
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
      LabelType.draft.id
    );
    let emailId, key;
    try {
      [emailId] = await createEmail(data);

      const params = {
        subject,
        threadId: this.state.threadId,
        recipients: to,
        body
      };
      const res = await signal.encryptPostEmail(params);

      const { metadataKey, date } = res.body;
      const threadId = this.state.threadId || res.body.threadId;
      key = metadataKey;
      const emailParams = { id: emailId, key, threadId, date };
      await updateEmail(emailParams);

      const emailLabelParams = {
        emailId,
        oldLabelId: LabelType.draft.id,
        newLabelId: LabelType.sent.id
      };
      await updateEmailLabel(emailLabelParams);

      closeComposerWindow();
    } catch (e) {
      if (e.message.includes('SQLITE_CONSTRAINT')) {
        // To remove
        await deleteEmailById(emailId);
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

  saveTemporalDraft = () => {
    const { data } = formOutgoingEmailFromData(this.state, LabelType.draft.id);
    saveDraftChanges(data);
  };
}

PrevMessage.propTypes = {
  children: PropTypes.array
};

export default ComposerWrapper;
