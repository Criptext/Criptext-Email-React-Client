import React, { Component } from 'react';
import './threads.css';
import ThreadItem from '../containers/ThreadItem';

class ThreadsList extends Component {
  componentDidMount() {
    this.props.onLoadThreads();
  }

  render() {
    return (
      <div className="threads-wrapper">
        <div className="threads-info-header">
          <div>INBOX</div>
          <div>Unread O-- All</div>
        </div>
        <div className="threads-container" onScroll={this.handleTableScrolled}>
          {this.props.threads.map((thread, index) => {
            return (
              <ThreadItem
                key={index}
                myIndex={index}
                thread={thread}
                selectedThread={this.props.selectedThread}
              />
            );
          })}
        </div>
      </div>
    );
  }

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
