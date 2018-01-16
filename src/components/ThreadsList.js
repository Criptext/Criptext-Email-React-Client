import React, { Component } from 'react';
import './threads.css';
import ThreadItem from '../containers/ThreadItem';
import { Switch } from 'react-switch-input';

class ThreadsList extends Component {
  render() {
    return (
      <div className="threads-wrapper">
        <div className="threads-info-header">
          <div className="threads-mailbox-label">INBOX</div>
          <div className="threads-toggle-container">
            <span>All</span>
            <Switch
              theme="two"
              name="unreadSwitch"
              onChange={this.handleSwitchChange}
              checked={this.props.unreadFilter}
            />
            <span>Unread</span>
          </div>
        </div>
        <div className="threads-container" onScroll={this.handleTableScrolled}>
          {this.props.threads.map((thread, index) => {
            return (
              <ThreadItem
                key={index}
                myIndex={index}
                mailbox={this.props.mailbox}
                thread={thread}
                selectedThread={this.props.selectedThread}
              />
            );
          })}
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.props.onLoadThreads();
  }

  handleSwitchChange = ev => {
    this.props.onUnreadToggle(ev.target.checked);
  };

  handleTableScrolled = e => {
    const scrollTop = e.target.scrollTop;
    const height = e.target.clientHeight;
    const scrollHeight = e.target.scrollHeight;

    if (scrollTop + height > scrollHeight - 25) {
      this.props.onLoadThreads();
    }
  };
}

export default ThreadsList;
