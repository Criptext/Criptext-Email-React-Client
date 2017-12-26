import React from 'react';
import './threads.css';

const ThreadView = props => {
  const thread = props.thread;
  return (
    <div
      className={'thread-container ' + props.class}
      onClick={() => {
        props.onSelectThread(props.myIndex);
      }}
    >
      <div>
        <div>{thread.header}</div>
        <div>{thread.date}</div>
      </div>
      <div>
        <div>{thread.subject}</div>
        <div>{thread.emails ? thread.emails.length : null}</div>
      </div>
      <div>
        <div>{thread.preview}</div>
        <div>
          {thread.timesOpened > 0 ? (
            <i className="material-icons">drafts</i>
          ) : null}
          {thread.timesOpened > 0 ? thread.timesOpened : null}
          {thread.totalAttachments > 0 ? (
            <i className="material-icons">attach_file</i>
          ) : null}
          {thread.totalAttachments > 0 ? thread.totalAttachments : null}
          {thread.hasOpenAttachments ? (
            <i className="material-icons">file_download</i>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ThreadView;
