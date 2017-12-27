import React, { Component } from 'react';
import './threads.css';
import ThreadItem from '../containers/ThreadItem';

class ThreadsList extends Component {
  componentDidMount() {
    this.props.onLoadThreads();
  }

  render() {
    return (
      <div className="threads-container">
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
    );
  }
}

export default ThreadsList;
