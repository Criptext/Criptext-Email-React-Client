import React, { Component } from 'react';
import Panel from './Panel';

class PanelWrapper extends Component {
  constructor() {
    super();
    this.state = {
      mailboxSelected: 'inbox',
      threadIdSelected: null
    };
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

export default PanelWrapper;
