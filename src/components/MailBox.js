import React, { Component } from 'react';
import './mailbox.css';

const MailBox = Component =>
  class extends Component {
    render() {
      return (
        <div className="mailbox-container">
          <header />
          <div>
            <Component {...this.props} />
          </div>
        </div>
      );
    }
  };

export default MailBox;
