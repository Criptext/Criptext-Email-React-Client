import React from 'react';
import ThreadsList from '../containers/ThreadsList';
import './mailbox.css';

const MailBox = props => (
  <div className="mailbox-container">
    <header />
    <ThreadsList mailbox={props.match.params.mailbox}/>
  </div>
);

export default MailBox;
