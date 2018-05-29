import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MailboxHeader from '../containers/MailboxHeader';
import Threads from '../containers/Threads';
import './mailbox.css';

class MailBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchParams: {
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachments: false
      }
    };
  }

  render() {
    return (
      <div className="mailbox-container">
        <MailboxHeader
          mailboxSelected={this.props.mailboxSelected}
          setSearchParams={this.handleSetSearchParams}
          onClickMailboxSelected={this.props.onClickMailboxSelected}
          onClickThreadIdSelected={this.props.onClickThreadIdSelected}
          onToggleActivityPanel={this.props.onToggleActivityPanel}
        />
        <Threads
          mailboxSelected={this.props.mailboxSelected}
          searchParams={this.state.searchParams}
          onClickThreadIdSelected={this.props.onClickThreadIdSelected}
        />
      </div>
    );
  }

  handleSetSearchParams = params => {
    this.setState({
      searchParams: {
        ...params
      }
    });
  };
}

MailBox.propTypes = {
  mailboxSelected: PropTypes.string,
  onClickMailboxSelected: PropTypes.func,
  onClickThreadIdSelected: PropTypes.func,
  onToggleActivityPanel: PropTypes.func
};

export default MailBox;
