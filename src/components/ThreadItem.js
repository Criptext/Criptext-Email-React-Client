import React, { Component } from 'react';
import './threads.css';
import * as Status from '../utils/ConstUtils';

class ThreadItem extends Component{
  
  constructor(){
    super();
    this.state={
      menuVisible: false
    }

    this.myself = null;
  }

  render() {
    const thread = this.props.thread;
    return (
      <div
        className={'thread-container ' + this.props.class}
        onClick={() => {
          this.props.onSelectThread(this.props.myIndex);
        }}
        ref={(c) => {this.myself = c}}
      >
        <div>
          <div style={{ background: this.props.color }} className="thread-letters">
            {thread.get('letters')}
          </div>
        </div>
        <div>{thread.get('header')}</div>
        <div>
          {willDisplaySecureIcon(thread)}
        </div>
        <div>
          {willRenderLabels(thread.get('labels'))}
          <div className="thread-subject">{thread.get('subject')}</div>
          <div className="thread-preview">
            <span> </span>
            <span> </span>
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
        <div onClick={(e) => {
          e.stopPropagation();
          this.setState({menuVisible: true})
        }}>
          <i className="material-icons">more_vert</i>
        </div>
        {this.renderMenu()}
      </div>
    );
  }

  renderMenu = () => {
    if(!this.state.menuVisible){
      return null;
    }

    const top = this.myself.offsetTop - this.myself.parentElement.scrollTop;
    const right = (window.innerWidth - this.myself.clientWidth)/2 + 1;

    return (<div>
      <div className='thread-overlay' onClick={(e) => {
          e.stopPropagation();
          this.setState({menuVisible: false})
        }}>

      </div>
      <div className='thread-menu' style={{
        top,
        right,
        position: 'fixed',
        zIndex: 1
      }}>
        <ul>
          <li>Holi</li>
          <li>Bye</li>
          <li>Cancelar</li>
        </ul>
      </div>
    </div>)
  }
};

const willDisplaySecureIcon = thread => {
  if (!thread.get('secure')) {
    return null;
  }

  return <i className="material-icons">lock</i>;
};

const willDisplayTimerIcon = thread => {
  const timerStatus = thread.get('timer');
  switch (timerStatus) {
    case Status.Timer.EXPIRED:
      return <i className="material-icons error-highlight">timer</i>;
    case Status.Timer.ENABLED:
      return <i className="material-icons">timer</i>;
    case Status.Timer.RUNNING:
      return <i className="material-icons neutral-highlight">timer</i>;
    default:
      return null;
  }
};

const willDisplayAttachIcon = thread => {
  if (thread.get('totalAttachments') > 0) {
    return <i className="material-icons">attach_file</i>;
  }

  return null;
};

const willDisplayAckIcon = thread => {
  const status = thread.get('status');
  switch (status) {
    case Status.Email.UNSENT:
      return <i className="material-icons error-highlight">undo</i>;
    case Status.Email.SENT:
      return <i className="material-icons">done</i>;
    case Status.Email.RECEIVED:
      return <i className="material-icons">done_all</i>;
    case Status.Email.OPENED:
      return <i className="material-icons neutral-highlight">done_all</i>;
    default:
      return null;
  }
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

export default ThreadItem;
