import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './../containers/Email';
import Label from './Label';
import './thread.css';

class Thread extends Component {
  render() {
    return (
      <div className="thread-container">
        <div className="thread-content">
          <div className="thread-info">
            <h1>{this.props.thread.subject}</h1>
            <div className="thread-labels">
              {this.props.labels.map((label, index) => {
                return (
                  <Label
                    key={index}
                    label={label}
                    onClickDelete={this.handleRemoveLabel}
                  />
                );
              })}
            </div>
          </div>
          <div className="thread-emails">
            {this.props.emails.map((email, index) => {
              const isLast = this.props.emails.size - 1 === index;
              return <Email key={index} email={email} staticOpen={isLast} />;
            })}
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.props.onLoadEmails(this.props.thread.threadId);
    if (this.props.thread.unread) {
      this.props.onUpdateUnreadEmails(this.props.thread, false);
    }
  }

  componentWillUnmount() {
    if (this.props.thread.unread) {
      this.props.onUpdateUnreadThread(this.props.thread, false);
    }
  }

  handleRemoveLabel = labelId => {
    this.props.onRemoveThreadLabel(this.props.thread.threadId, labelId);
  };
}

Thread.propTypes = {
  emails: PropTypes.object,
  labels: PropTypes.array,
  onLoadEmails: PropTypes.func,
  onUpdateUnreadEmails: PropTypes.func,
  onUpdateUnreadThread: PropTypes.func,
  onRemoveThreadLabel: PropTypes.func,
  thread: PropTypes.object
};

export default Thread;
