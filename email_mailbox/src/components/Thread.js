/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './../containers/Email';
import Label from './Label';
import Message from '../containers/Message';
import './thread.css';

class Thread extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.thread.emailIds.length > this.props.thread.emailIds.length) {
      this.props.onLoadEmails(nextProps.thread.threadId);
    }
  }

  render() {
    return (
      <div className="thread-container">
        <Message mailbox={this.props.mailboxSelected} />
        <div className="thread-content">
          <div className="thread-info">
            <div className="thread-info-title">
              <h1>{this.props.thread.subject}</h1>
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
            <div
              className={`thread-starred-status ${
                this.props.starred ? 'starred-on' : 'starred-off'
              }`}
            >
              <i
                className={this.props.starred ? 'icon-star-fill' : 'icon-star'}
                onClick={() => this.handleToggleStar()}
              />
            </div>
          </div>
          <div className="thread-emails">
            {this.props.emails.map((email, index) => {
              const isLast = this.props.emails.length - 1 === index;
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
      this.props.onUpdateUnreadEmails(this.props.thread);
    }
  }

  handleRemoveLabel = labelId => {
    this.props.onRemoveLabelIdThread(this.props.thread.threadId, labelId);
  };

  handleToggleStar = () => {
    this.props.onToggleStar(this.props.thread.threadId, this.props.starred);
  };
}

Thread.propTypes = {
  emails: PropTypes.array,
  labels: PropTypes.array,
  mailboxSelected: PropTypes.string,
  onLoadEmails: PropTypes.func,
  onUpdateUnreadEmails: PropTypes.func,
  onRemoveLabelIdThread: PropTypes.func,
  onToggleStar: PropTypes.func,
  starred: PropTypes.bool,
  thread: PropTypes.object
};

export default Thread;
