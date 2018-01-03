import React, { Component } from 'react';
import './threads.css';
import * as Status from '../utils/ConstUtils';

class ThreadItem extends Component {
  constructor() {
    super();
    this.state = {
      hoveringName: false
    };

    this.myself = null;
  }

  render() {
    const thread = this.props.thread;
    return (
      <div
        className={'thread-container ' + this.props.class}
        onClick={this.onSelectThread}
        ref={c => {
          this.myself = c;
        }}
      >
        <div onMouseEnter={this.onMultiEnter} onMouseLeave={this.onMultiLeave}>
          {this.renderFirstColumn()}
        </div>
        <div>{thread.get('header')}</div>
        <div>{willDisplaySecureIcon(thread)}</div>
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
        {this.renderMenu()}
      </div>
    );
  }

  onMultiEnter = () => {
    this.setState({
      hoveringName: true
    });
  };

  onMultiLeave = () => {
    this.setState({
      hoveringName: false
    });
  };

  onSelectThread = () => {
    this.props.onSelectThread(this.props.myIndex);
  };

  stopPropagation = ev => {
    ev.stopPropagation();
  };

  onCheck = ev => {
    const value = ev.target.checked;
    this.props.onMultiSelect(this.props.thread.get('id'), value);
  };

  renderFirstColumn = () => {
    if (this.props.multiselect || this.state.hoveringName) {
      return (
        <label className="container">
          <input
            type="checkbox"
            onClick={this.stopPropagation}
            checked={this.props.thread.get('selected')}
            onChange={this.onCheck}
          />
          <span className="checkmark" />
        </label>
      );
    }

    return (
      <div style={{ background: this.props.color }} className="thread-letters">
        {this.props.thread.get('letters')}
      </div>
    );
  };

  renderMenu = () => {
    if (false) {
      return null;
    }

    return (
      <div>
        <div
          className={this.props.starred ? 'thread-label-mark' : ''}
          onClick={ev => {
            ev.stopPropagation();
            this.props.onStarClick();
          }}
        >
          <i className="material-icons">star</i>
        </div>
        <div
          className={this.props.important ? 'thread-label-mark' : ''}
          onClick={ev => {
            ev.stopPropagation();
            this.props.onImportantClick();
          }}
        >
          <i className="material-icons">label_outline</i>
        </div>
        <div>
          <i className="material-icons">delete</i>
        </div>
      </div>
    );
  };
}

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
      <div>{labels.size - 1}+</div>
    </div>
  );
};

export default ThreadItem;
