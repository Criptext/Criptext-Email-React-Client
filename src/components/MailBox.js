import React from 'react';
import Header from '../containers/Header'
import ThreadsList from '../containers/ThreadsList';
import './mailbox.css';

const MailBox = props => (
  <div className="mailbox-container">
    <Header />
    <ThreadsList mailbox={props.match.params.mailbox} />
  </div>
);

export default MailBox;
