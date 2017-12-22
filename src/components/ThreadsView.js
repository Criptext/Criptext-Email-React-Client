import React, { Component } from 'react';
import './threads.css';
import ThreadView from './ThreadView';

class ThreadsView extends Component {
  componentDidMount() {
    fetch('/threads.json').then( response => {
      if (response.status === 200) {
        return response.json()
      }
      return Promise.reject(response.status)
    }).then( json => {
      this.props.onAddThreads(json.threads);
    }).catch( err => {
      console.error(err);
    })
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
