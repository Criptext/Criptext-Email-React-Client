import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as Status from '../utils/ConstUtils';
import ReactTooltip from 'react-tooltip';
import randomcolor from 'randomcolor';
import CustomCheckbox from './CustomCheckbox';
import './threaditem.css';

class ThreadItem extends Component {
  render() {
    const visibleStyle = this.getStyleVisibilityByMultiselect();
    const {mailbox, thread, myClass, onRegionEnter, onRegionLeave } = this.props;
    return (
      <div
        className={'thread-item-container ' + myClass}
        onClick={this.onSelectThread}
      >
        <Link to={`/${mailbox}/${thread.get('id')}`}>
          <div
            onMouseEnter={onRegionEnter}
            onMouseLeave={onRegionLeave}
          >
            {this.renderFirstColumn()}
          </div>
          <div>{thread.get('header')}</div>
          <div>{this.willDisplaySecureIcon(thread)}</div>
          <div>
            {this.willRenderLabels(thread.get('labels'), thread.get('id'))}
            <div className="thread-subject">{thread.get('subject')}</div>
            <div className="thread-preview">
              {this.renderMultipleSpaces(3)}
              {thread.get('preview')}
            </div>
          </div>
          <div style={visibleStyle}>
            <div />
            <div>{this.willDisplayAttachIcon(thread)}</div>
            <div>{this.willDisplayAckIcon(thread)}</div>
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
    this.props.onSelectThread(this.props.thread.get('id'));
  };

  stopPropagation = ev => {
    ev.stopPropagation();
  };

  onCheck = value => {
    this.props.onMultiSelect(this.props.thread.get('id'), value);
  };

  renderMultipleSpaces = times => {
    return Array.from(Array(times).keys()).map(index => {
      return <span key={index}> </span>;
    });
  };

  renderFirstColumn = () => {
    if (this.props.multiselect || this.props.hovering) {
      return <CustomCheckbox
        status={this.props.thread.get('selected')}
        onCheck={this.onCheck} />
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

    const threadId = this.props.thread.get('id');

    return (
      <div className="thread-label-option">
        <div
          data-tip data-for={`starred${threadId}`}
          className={this.props.starred ? 'thread-label-mark' : ''}
          onClick={ev => {
            ev.stopPropagation();
            this.props.onStarClick();
          }}
        >
          <i className="material-icons">star</i>
          <ReactTooltip
            place="top"
            className="labels-tooltip"
            id={`starred${threadId}`}
            type="dark"
            effect="solid"
          >
            Favorite
            <div className="tooltip-tip"> </div>
          </ReactTooltip>
        </div>
        <div
          data-tip data-for={`important${threadId}`}
          className={this.props.important ? 'thread-label-mark' : ''}
          onClick={ev => {
            ev.stopPropagation();
            this.props.onImportantClick();
          }}
        >
          <i className="material-icons">label_outline</i>
          <ReactTooltip
            place="top"
            className="labels-tooltip"
            id={`important${threadId}`}
            type="dark"
            effect="solid"
          >
            Important
            <div className="tooltip-tip"> </div>
          </ReactTooltip>
        </div>
        
        <div
          data-tip data-for={`remove${threadId}`} 
          onClick={this.onRemove}
        >
          <i className="material-icons">delete</i>
          <ReactTooltip
            place="top"
            className="labels-tooltip"
            id={`remove${threadId}`}
            type="dark"
            effect="solid"
          >
            Move to trash
            <div className="tooltip-tip"> </div>
          </ReactTooltip>
        </div>
      </div>
    );
  };

  onRemove = (ev) => {
    ev.stopPropagation();
    this.props.onRemove();
  }

  willDisplaySecureIcon = thread => {
    if (!thread.get('secure')) {
      return null;
    }
  
    return <i className="material-icons">lock</i>;
  };
  
  willDisplayAttachIcon = thread => {
    if (thread.get('totalAttachments') > 0) {
      return <i className="material-icons">attach_file</i>;
    }
  
    return null;
  };
  
  willDisplayAckIcon = thread => {
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
  
  willRenderLabels = (labels, threadId) => {
    if (!labels || labels.size === 0) {
      return null;
    }
  
    const labelColor = randomcolor({
      seed: labels.first(),
      luminosity: 'bright'
    });
    const firstLabel = this.props.labels.get(labels.first().toString()).get('text')
    if (labels.size === 1) {
      return (
        <div className="thread-label">
          <div style={{ backgroundColor: labelColor }}>
            {firstLabel}
          </div>
        </div>
      );
    }
  
    return (
      <div className="thread-label">
        <div style={{ backgroundColor: labelColor }}>{firstLabel}</div>
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
              luminosity: 'bright'
            });
            return (
              <div key={label} style={{ backgroundColor: lColor }} className="innerLabel">
                {this.props.labels.get(label.toString()).get('text')}
              </div>
            );
          })}
          <div className="tooltip-tip"> </div>
        </ReactTooltip>
      </div>
    );
  };

}

export default ThreadItem;
