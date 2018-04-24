import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './../containers/Email';
import ThreadHeader from './../containers/ThreadHeader';
import Label from './Label';
import './thread.css';

class Thread extends Component {
  render() {
    return (
      <div className="thread-container">
        <ThreadHeader
          isOpenActivityPanel={this.props.isOpenActivityPanel}
          mailbox={this.props.mailbox}
          thread={this.props.thread}
          onClickThreadBack={this.props.onClickThreadBack}
          onToggleActivityPanel={this.props.onToggleActivityPanel}
        />
        <div className="thread-content">
          <div className="thread-info">
            <h1>{this.props.thread.subject}</h1>
            <div className="thread-labels">
              {this.props.labels.map((label, index) => {
                return (
                  <Label
                    key={index}
                    label={label}
                    onClick={this.onRemoveLabel}
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
  }

  onRemoveLabel = labelId => {
    this.props.onRemoveThreadLabel(this.props.thread.threadId, labelId);
  };
}

Thread.propTypes = {
  emails: PropTypes.object,
  isOpenActivityPanel: PropTypes.bool,
  labels: PropTypes.array,
  mailbox: PropTypes.string,
  onClickThreadBack: PropTypes.func,
  onLoadEmails: PropTypes.func,
  onRemoveThreadLabel: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  thread: PropTypes.object
};

export default Thread;
