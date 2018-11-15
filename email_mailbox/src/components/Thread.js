/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './../containers/Email';
import Label from './Label';
import Message from '../containers/Message';
import './thread.scss';

class Thread extends Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.thread && !nextProps.thread) {
      this.props.onBackOption();
    } else if (this.props.thread.unread) {
      if (
        nextProps.emailKeysUnread.length !==
          this.props.emailKeysUnread.length ||
        nextProps.myEmailKeysUnread.length !==
          this.props.myEmailKeysUnread.length
      ) {
        this.props.onUpdateUnreadEmails(
          nextProps.emailKeysUnread,
          nextProps.myEmailKeysUnread,
          nextProps.thread.threadId
        );
      }
    }
  }

  render() {
    return (
      <div className="thread-container">
        <Message
          mailbox={this.props.mailboxSelected}
          onClickSection={this.props.onClickSection}
        />
        <div className="thread-content">
          <div className="thread-info">
            <div className="thread-info-title">
              <h1>{this.props.thread ? this.props.thread.subject : ''}</h1>
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
              return (
                <Email
                  key={index}
                  email={email}
                  staticOpen={isLast}
                  count={this.props.emails.length}
                  onBackOption={this.props.onBackOption}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (this.props.emails.length !== this.props.thread.emailIds.length) {
      this.props.onLoadEmails(this.props.thread.threadId);
    } else {
      this.props.onUpdateUnreadEmails(
        this.props.emailKeysUnread,
        this.props.myEmailKeysUnread,
        this.props.thread.threadId
      );
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
  emailIds: PropTypes.array,
  emails: PropTypes.array,
  emailKeysUnread: PropTypes.array,
  labels: PropTypes.array,
  mailboxSelected: PropTypes.string,
  myEmailKeysUnread: PropTypes.array,
  onBackOption: PropTypes.func,
  onClickSection: PropTypes.func,
  onLoadEmails: PropTypes.func,
  onUpdateUnreadEmails: PropTypes.func,
  onRemoveLabelIdThread: PropTypes.func,
  onToggleStar: PropTypes.func,
  starred: PropTypes.bool,
  thread: PropTypes.object
};

export default Thread;
