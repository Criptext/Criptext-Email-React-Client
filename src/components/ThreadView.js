import React from 'react';
import './threads.css';
import * as TimeUtils from '../utils/TimeUtils';
import * as UserUtils from '../utils/UserUtils';

const getThreadClass = (thread, threadPos, selectedThread) => {
  if (threadPos === selectedThread) {
    return 'thread-selected';
  } else if (thread.unread && threadPos !== selectedThread) {
    return 'thread-unread';
  }
  return 'thread-read';
};

const ThreadView = props => {
  const thread = props.thread.toObject();
  return (
    <div
      className={
        'thread-container ' +
        getThreadClass(thread, props.myIndex, props.selectedThread)
      }
      onClick={() => {
        props.onSelectThread(props.myIndex);
      }}
    >
      <div>
        <div>{UserUtils.parseContact(thread.sender).name}</div>
        <div>{TimeUtils.defineTimeByToday(thread.lastEmailDate)}</div>
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
