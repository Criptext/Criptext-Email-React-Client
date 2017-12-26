import React, { Component } from 'react';
import './threads.css';
import ThreadView from './ThreadView';

class ThreadsView extends Component {
  componentDidMount() {
    this.props.onLoadThreads();
  }

  render() {
    return (
      <div className="threads-container">
        {this.props.threads.map((thread, index) => {
          return (
            <ThreadView
              key={thread.get('id')}
              myIndex={index}
              thread={thread}
              onSelectThread={this.props.onSelectThread}
              selectedThread={this.props.selectedThread}
            />
          );
        })}
      </div>
    );
  }
}

export default ThreadsView;
