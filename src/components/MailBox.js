import React from 'react';
import PropTypes from 'prop-types';
import MailboxHeader from '../containers/MailboxHeader';
import Threads from '../containers/Threads';
import './mailbox.css';

const MailBox = props => (
  <div className="mailbox-container">
    <MailboxHeader />
    <Threads mailbox={props.match.params.mailbox} />
  </div>
);

MailBox.propTypes = {
  match: PropTypes.object
};

export default MailBox;
