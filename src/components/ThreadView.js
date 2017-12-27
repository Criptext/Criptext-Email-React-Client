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
        <div style={{ background: props.color }} className="thread-letters">
          {thread.get('letters')}
        </div>
      </div>
      <div>{thread.get('header')}</div>
      <div>
        <i className="material-icons">lock</i>
      </div>
      <div>
        {willRenderLabels(thread.get('labels'))}
        <div className="thread-subject">{thread.get('subject')}</div>
        <div className="thread-preview">
          <span> </span>
          {thread.get('preview')}
        </div>
      </div>
      <div>
        <div>{willDisplayTimerIcon(thread)}</div>
        <div>{willDisplayAttachIcon(thread)}</div>
        <div>{willDisplayAckIcon(thread)}</div>
      </div>
      <div>{thread.get('date')}</div>
      <div>
        <i className="material-icons">more_vert</i>
      </div>
    </div>
  );
};

const willDisplayTimerIcon = thread => {
  if (true) {
    return <i className="material-icons">timer</i>;
  }

  return null;
};

const willDisplayAttachIcon = thread => {
  if (true) {
    return <i className="material-icons">attach_file</i>;
  }

  return null;
};

const willDisplayAckIcon = thread => {
  if (true) {
    return <i className="material-icons">done_all</i>;
  }

  return null;
};

const willRenderLabels = labels => {
  if (!labels || labels.size === 0) {
    return null;
  }
  if (labels.size === 1) {
    return (
      <div className="thread-label">
        <div>{labels.first()}</div>
      </div>
    );
  }

  return (
    <div className="thread-label">
      <div>{labels.first()}</div>
      <div>+{labels.size - 1}</div>
    </div>
  );
};

export default ThreadView;
