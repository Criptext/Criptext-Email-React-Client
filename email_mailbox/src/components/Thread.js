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
          thread={this.props.thread}
          onClickThreadBack={this.props.onClickThreadBack}
        />
        <div className="thread-content">
          <div className="thread-info">
            <h1>{this.props.thread.get('subject')}</h1>
            <div className="thread-labels">
              {this.props.labels.map((label, index) => {
                return (
                  <Label key={index} text={label.text} color={label.color} />
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
    this.props.onLoadEmails(this.props.thread.get('threadId'));
  }
}

Thread.propTypes = {
  emails: PropTypes.object,
  labels: PropTypes.array,
  onClickThreadBack: PropTypes.func,
  onLoadEmails: PropTypes.func,
  thread: PropTypes.object
};

export default Thread;
