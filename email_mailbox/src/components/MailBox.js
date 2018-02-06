import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MailboxHeader from '../containers/MailboxHeader';
import Threads from '../containers/Threads';
import './mailbox.css';

const ALL_MAIL = -1;

class MailBox extends Component {
  constructor() {
    super();
    this.state = {
      searchParams: {
        text: '',
        mailbox: ALL_MAIL,
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
          setSearchParams={this.setSearchParams}
          onClickMailboxSelected={this.props.onClickMailboxSelected}
        />
        <Threads
          mailbox={this.props.mailbox}
          searchParams={this.state.searchParams}
          onClickThreadIdSelected={this.props.onClickThreadIdSelected}
        />
      </div>
    );
  }

  setSearchParams = params => {
    this.setState({
      searchParams: {
        ...params
      }
    });
  };
}

MailBox.propTypes = {
  mailbox: PropTypes.string,
  onClickMailboxSelected: PropTypes.func,
  onClickThreadIdSelected: PropTypes.func
};

export default MailBox;
