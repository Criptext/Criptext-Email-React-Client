import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EmailStatus } from '../utils/const';
import CustomCheckbox, { CustomCheckboxStatus } from './CustomCheckbox';
import { replaceMatches } from '../utils/ReactUtils';
import './threaditem.css';

class ThreadItem extends Component {
  render() {
    const visibleStyle = this.getStyleVisibilityByMultiselect();
    const {
      thread,
      myClass,
      onRegionEnter,
      onRegionLeave,
      onSelectThread,
      labels
    } = this.props;
    return (
      <div
        className={'thread-item-container ' + myClass}
        onClick={() => {
          onSelectThread(thread.get('id'));
        }}
      >
        <a>
          <div onMouseEnter={onRegionEnter} onMouseLeave={onRegionLeave}>
            {this.renderFirstColumn()}
          </div>
          <div>
            <span>{thread.get('header')}</span>
          </div>
          <div>{this.willDisplaySecureIcon(thread)}</div>
          <div>
            {this.renderLabels(labels, thread.get('id'))}
            <div className="thread-subject">
              <span>{this.renderSubject()}</span>
            </div>
            <div className="thread-preview">
              {this.renderMultipleSpaces(3)}
              {this.renderPreview()}
            </div>
          </div>
          <div style={visibleStyle}>
            <div />
            <div>{this.willDisplayAttachIcon(thread)}</div>
            <div>{this.willDisplayAckIcon(thread)}</div>
          </div>
          <div style={visibleStyle}>
            <span>{thread.get('date')}</span>
          </div>
        </a>
        {this.renderMenu()}
      </div>
    );
  }

  renderPreview = () => {
    const preview = this.props.thread.get('preview');
    if (this.props.mailbox !== 'search') {
      return preview;
    }

    return replaceMatches(this.props.searchParams.text, preview);
  };

  renderSubject = () => {
    const subject = this.props.thread.get('subject');
    if (this.props.mailbox !== 'search') {
      return subject;
    }

    return replaceMatches(this.props.searchParams.subject, subject);
  };

  getStyleVisibilityByMultiselect = () => {
    if (!this.props.multiselect) {
      return null;
    }

    return {
      visibility: 'visible'
    };
  };

  stopPropagation = ev => {
    ev.stopPropagation();
  };

  onCheck = value => {
    this.props.onMultiSelect(
      this.props.thread.get('id'),
      CustomCheckboxStatus.toBoolean(value)
    );
  };

  renderMultipleSpaces = times => {
    return Array.from(Array(times).keys()).map(index => {
      return <span key={index}> </span>;
    });
  };

  renderFirstColumn = () => {
    if (this.props.multiselect || this.props.hovering) {
      return (
        <CustomCheckbox
          status={CustomCheckboxStatus.fromBoolean(
            this.props.thread.get('selected')
          )}
          onCheck={this.onCheck}
        />
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

    const threadId = this.props.thread.get('id');

    return (
      <div className="thread-label-option">
        <HoverMenuItem
          targetId={`starred${threadId}`}
          tip="Favorite"
          icon="icon-star"
          myClass={this.props.starred ? 'thread-label-mark' : ''}
          onClick={this.onStarClick}
          onMouseEnterItem={this.props.onMouseEnterItem}
          onMouserLeaveItem={this.props.onMouserLeaveItem}
        />
        <HoverMenuItem
          targetId={`important${threadId}`}
          tip="Important"
          icon="icon-tag"
          myClass={this.props.important ? 'thread-label-mark' : ''}
          onClick={this.onImportantClick}
          onMouseEnterItem={this.props.onMouseEnterItem}
          onMouserLeaveItem={this.props.onMouserLeaveItem}
        />
        <HoverMenuItem
          targetId={`remove${threadId}`}
          tip="Move to Trash"
          icon="icon-trash"
          onClick={this.onRemove}
          onMouseEnterItem={this.props.onMouseEnterItem}
          onMouserLeaveItem={this.props.onMouserLeaveItem}
        />
      </div>
    );
  };

  onStarClick = ev => {
    ev.stopPropagation();
    this.props.onStarClick();
  };

  onImportantClick = ev => {
    ev.stopPropagation();
    this.props.onImportantClick();
  };

  onRemove = ev => {
    ev.stopPropagation();
    this.props.onRemove();
  };

  willDisplaySecureIcon = thread => {
    if (!thread.get('secure')) {
      return null;
    }

    return <i className="icon-lock" />;
  };

  willDisplayAttachIcon = thread => {
    if (thread.get('totalAttachments') > 0) {
      return <i className="icon-attach" />;
    }

    return null;
  };

  willDisplayAckIcon = thread => {
    const status = thread.get('status');
    switch (status) {
      case EmailStatus.UNSENT:
        return <i className="material-icons error-highlight">undo</i>;
      case EmailStatus.SENT:
        return <i className="material-icons">done</i>;
      case EmailStatus.RECEIVED:
        return <i className="icon-checked" />;
      case EmailStatus.OPENED:
        return <i className="icon-checked neutral-highlight" />;
      default:
        return null;
    }
  };

  renderLabels = (labels, threadId) => {
    if (!labels.length) {
      return null;
    }

    return (
      <div className="thread-label">
        <div style={{ backgroundColor: labels[0].color }}>{labels[0].text}</div>
        {labels.length > 1 ? this.renderMoreLabels(labels, threadId) : null}
      </div>
    );
  };

  renderMoreLabels = (labels, threadId) => {
    return (
      <div
        data-tip
        data-for={`labelstip${threadId}`}
        onMouseEnter={() => {
          this.props.onMouseEnterItem(`labelstip${threadId}`, labels);
        }}
        onMouseLeave={() => {
          this.props.onMouserLeaveItem(`labelstip${threadId}`);
        }}
      >
        <span>{labels.length - 1}+</span>
      </div>
    );
  };
}

const HoverMenuItem = props => (
  <div
    className={props.myClass}
    data-tip
    data-for={props.targetId}
    onClick={props.onClick}
    onMouseEnter={() => {
      props.onMouseEnterItem(props.targetId, props.tip);
    }}
    onMouseLeave={() => {
      props.onMouserLeaveItem(props.targetId);
    }}
  >
    <i className={props.icon} />
  </div>
);

HoverMenuItem.propTypes = {
  icon: PropTypes.string,
  myClass: PropTypes.string,
  onClick: PropTypes.func,
  onMouseEnterItem: PropTypes.func,
  onMouserLeaveItem: PropTypes.func,
  targetId: PropTypes.string,
  tip: PropTypes.string
};

ThreadItem.defaultProps = {
  myClass: ''
};

ThreadItem.propTypes = {
  color: PropTypes.string,
  hovering: PropTypes.bool,
  important: PropTypes.bool,
  labels: PropTypes.array,
  mailbox: PropTypes.string,
  multiselect: PropTypes.bool,
  myClass: PropTypes.string,
  onImportantClick: PropTypes.func,
  onMouseEnterItem: PropTypes.func,
  onMouserLeaveItem: PropTypes.func,
  onMultiSelect: PropTypes.func,
  onRegionEnter: PropTypes.func,
  onRegionLeave: PropTypes.func,
  onSelectThread: PropTypes.func,
  onStarClick: PropTypes.func,
  onRemove: PropTypes.func,
  searchParams: PropTypes.object,
  starred: PropTypes.bool,
  thread: PropTypes.object
};

export default ThreadItem;
