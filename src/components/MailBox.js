import React from 'react';
import HeaderWrapper from './HeaderWrapper'
import ThreadsList from '../containers/ThreadsList';
import './mailbox.css';

const MailBox = props => (
  <div className="mailbox-container">
    <HeaderWrapper />
    <ThreadsList mailbox={props.match.params.mailbox} />
  </div>
);

export default MailBox;
