import React from 'react';
import './threads.css';

const ThreadItem = props => {
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
        <div className='thread-icons'>
          {willDisplayOpenIcon(thread)}
          {willDisplayAttachIcon(thread)}
          {willDisplayOpenAttachIcon(thread)}
        </div>
      </div>
    </div>
  );
};

const willDisplayOpenIcon = thread => {
  if(thread.timesOpened > 0){
    return (<div>
      <i className="material-icons">drafts</i>
      {thread.timesOpened}
    </div>)
  }

  return null
}

const willDisplayAttachIcon = thread => {
  if(thread.totalAttachments > 0){
    return (<div>
      <i className="material-icons">attach_file</i>
      {thread.totalAttachments}
    </div>)
  }

  return null
}

const willDisplayOpenAttachIcon = thread => {
  if(thread.timesOpened > 0){
    return <i className="material-icons">file_download</i>;
  }

  return null
}

export default ThreadItem;
