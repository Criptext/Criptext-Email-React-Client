import React, { Component } from 'react';
import Panel from './Panel';
import PropTypes from 'prop-types';
import { addEvent, Event } from '../utils/electronEventInterface';
import { LabelType } from '../utils/electronInterface';

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mailboxSelected: 'inbox',
      threadIdSelected: null
    };

    addEvent(Event.NEW_EMAIL, emailParams => {
      const currentLabelId = LabelType[this.state.mailboxSelected].id;
      if (emailParams.labels.indexOf(currentLabelId) >= 0) {
        props.onLoadThreads({
          labelId: Number(currentLabelId),
          clear: true,
          limit: this.props.threadsCount
        });
      }
    });
  }

  render() {
    return (
      <Panel
        mailboxSelected={this.state.mailboxSelected}
        threadIdSelected={this.state.threadIdSelected}
        onClickMailboxSelected={this.handleOnClickMailboxSelected}
        onClickThreadBack={this.handleOnClickThreadBack}
        onClickThreadIdSelected={this.handleOnClickThreadIdSelected}
        {...this.props}
      />
    );
  }

  handleOnClickMailboxSelected = value => {
    this.setState({ mailboxSelected: value, threadIdSelected: null });
  };

  handleOnClickThreadBack = () => {
    this.setState({ threadIdSelected: null });
  };

  handleOnClickThreadIdSelected = (threadId, mailbox) => {
    this.setState({ mailboxSelected: mailbox, threadIdSelected: threadId });
  };
}

PanelWrapper.propTypes = {
  onLoadEmails: PropTypes.func,
  onLoadThreads: PropTypes.func,
  threadsCount: PropTypes.number
};

export default PanelWrapper;
