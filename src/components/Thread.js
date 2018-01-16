import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './../containers/Email';
import ThreadHeader from './../containers/ThreadHeader';
import './thread.css';

class Thread extends Component {
  render() {
    return (
      <div className="thread-container">
        <ThreadHeader
          thread={this.props.thread}
          threadsSelected={this.props.threadId}
        />
        <div className="thread-content">
          <div className="thread-info" />
          <div className="thread-emails">
            {this.props.emails.map((email, index) => {
              const isLast = this.props.emails.size - 1 === index;
              return <Email key={index} email={email} isOpen={isLast} />;
            })}
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.props.onLoadEmails();
  }
}

Thread.propTypes = {
  emails: PropTypes.object
};

export default Thread;
