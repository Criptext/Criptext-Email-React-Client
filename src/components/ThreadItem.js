import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as Status from '../utils/ConstUtils';
import ReactTooltip from 'react-tooltip';
import randomcolor from 'randomcolor';
import './threaditem.css';

class ThreadItem extends Component {
  render() {
    const visibleStyle = this.getStyleVisibilityByMultiselect();
    const thread = this.props.thread;
    return (
      <div
        className={'thread-item-container ' + this.props.class}
        onClick={this.onSelectThread}
      >
        <Link to={"/"+this.props.mailbox+"/"+thread.get('id')}>
          <div
            onMouseEnter={this.props.onRegionEnter}
            onMouseLeave={this.props.onRegionLeave}
          >
            {this.renderFirstColumn()}
          </div>
          <div>{thread.get('header')}</div>
          <div>{willDisplaySecureIcon(thread)}</div>
          <div>
            {willRenderLabels(thread.get('labels'), thread.get('id'))}
            <div className="thread-subject">{thread.get('subject')}</div>
            <div className="thread-preview">
              {this.renderMultipleSpaces(3)}
              {thread.get('preview')}
            </div>
          </div>
          <div style={visibleStyle}>
            <div />
            <div>{willDisplayAttachIcon(thread)}</div>
            <div>{willDisplayAckIcon(thread)}</div>
          </div>
          <div style={visibleStyle}>{thread.get('date')}</div>
        </Link>
        {this.renderMenu()}
      </div>
    );
  }

  getStyleVisibilityByMultiselect = () => {
    if (!this.props.multiselect) {
      return null;
    }

    return {
      visibility: 'visible'
    };
  };

  onSelectThread = () => {
    this.props.onSelectThread(this.props.myIndex);
  };

  stopPropagation = ev => {
    ev.stopPropagation();
  };

  onCheck = ev => {
    ev.stopPropagation();
    const value = ev.target.checked;
    this.props.onMultiSelect(this.props.thread.get('id'), value);
  };

  renderMultipleSpaces = times => {
    return Array.from(Array(times).keys()).map(index => {
      return <span key={index}> </span>;
    });
  };

  renderFirstColumn = () => {
    if (this.props.multiselect || this.props.hovering) {
      return (
        <label className="container" onClick={this.stopPropagation}>
          <input
            type="checkbox"
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
    if (this.props.multiselect) {
      return null;
    }

    return (
      <div className="thread-label-option">
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

const willRenderLabels = (labels, threadId) => {
  if (!labels || labels.size === 0) {
    return null;
  }

  const labelColor = randomcolor({
    seed: labels.first(),
    luminosity: 'light'
  });

  if (labels.size === 1) {
    return (
      <div className="thread-label">
        <div style={{ backgroundColor: labelColor }}>{labels.first()}</div>
      </div>
    );
  }

  return (
    <div className="thread-label">
      <div style={{ backgroundColor: labelColor }}>{labels.first()}</div>
      <div data-tip data-for={`labelstip${threadId}`}>
        {labels.size - 1}+
      </div>
      <ReactTooltip
        place="top"
        className="labels-tooltip"
        id={`labelstip${threadId}`}
        type="dark"
        effect="solid"
      >
        {labels.map(label => {
          const lColor = randomcolor({
            seed: label,
            luminosity: 'light'
          });
          return (
            <div style={{ backgroundColor: lColor }} className="innerLabel">
              {label}
            </div>
          );
        })}
        <div className="tooltip-tip"> </div>
      </ReactTooltip>
    </div>
  );
};

export default ThreadItem;
