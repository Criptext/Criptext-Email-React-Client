import React, { Component } from 'react';
import './threads.css';
import ThreadView from './ThreadView';

class ThreadsView extends Component {
  componentDidMount() {
    const req = new XMLHttpRequest();
    req.open('GET', '/threads.json', true);
    req.onload = ev => {
      if (req.status === 200) {
        this.props.onAddThreads(JSON.parse(req.responseText).threads);
        return;
      }
    };
    req.send();
  }

  render() {
    return (
      <div className="threads-container">
        {Object.keys(this.props.threads).map(key => {
          const thread = this.props.threads[key];
          return (
            <ThreadView
              key={thread.id}
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
