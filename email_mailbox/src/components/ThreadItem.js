import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EmailStatus } from './../utils/const';
import CustomCheckbox, { CustomCheckboxStatus } from './CustomCheckbox';
import { replaceMatches } from './../utils/ReactUtils';
import { replaceAllOccurrences } from './../utils/StringUtils';
import './threaditem.css';

class ThreadItem extends Component {
  render() {
    const visibleStyle = this.getStyleVisibilityByMultiselect();
    const {
      checked,
      thread,
      onRegionEnter,
      onRegionLeave,
      onSelectThread,
      labels,
      header
    } = this.props;
    return (
      <div
        className={
          'thread-item-container ' +
          (thread.unread ? 'thread-unread' : 'thread-read') +
          (checked ? ' thread-checked' : '')
        }
        onClick={() => {
          onSelectThread(thread);
        }}
      >
        <a>
          <div onMouseEnter={onRegionEnter} onMouseLeave={onRegionLeave}>
            {this.renderFirstColumn()}
          </div>
          <div>
            <span>{header}</span>
          </div>
          <div>
            {this.renderLabels(labels, thread.id)}
            <div className="thread-subject">
              <span>{this.renderSubject()}</span>
            </div>
            <div className="thread-preview">
              {this.renderMultipleSpaces(3)}
              <span>{this.renderPreview()}</span>
            </div>
          </div>
          <div style={visibleStyle}>
            <div>{this.willDisplayAttachIcon(thread)}</div>
            <div>{this.willDisplayAckIcon(thread)}</div>
          </div>
          <div style={visibleStyle}>
            <span>{thread.date}</span>
          </div>
        </a>
        {this.renderMenu()}
      </div>
    );
  }

  renderPreview = () => {
    const preview = replaceAllOccurrences(this.props.thread.preview, '\n', ' ');
    if (this.props.mailbox !== 'search') {
      return preview;
    }

    return replaceMatches(this.props.searchParams.text, preview);
  };

  renderSubject = () => {
    const subject = this.props.thread.subject;
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
    this.props.onCheckItem(
      this.props.thread.id,
      CustomCheckboxStatus.toBoolean(value)
    );
  };

  renderMultipleSpaces = times => {
    return Array.from(Array(times).keys()).map(index => {
      return <span key={index}> </span>;
    });
  };

  renderFirstColumn = () => {
    if (!this.props.isHiddenCheckBox || this.props.hovering) {
      return (
        <CustomCheckbox
          status={CustomCheckboxStatus.fromBoolean(this.props.checked)}
          onCheck={this.onCheck}
        />
      );
    }

    return (
      <div style={{ background: this.props.color }} className="thread-letters">
        {this.props.letters}
      </div>
    );
  };

  renderMenu = () => {
    if (this.props.multiselect) {
      return null;
    }

    const threadId = this.props.thread.id;

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

  willDisplayAttachIcon = thread => {
    if (thread.totalAttachments > 0) {
      return <i className="icon-attach" />;
    }

    return null;
  };

  willDisplayAckIcon = thread => {
    const status = thread.status;
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

ThreadItem.propTypes = {
  color: PropTypes.string,
  checked: PropTypes.bool,
  header: PropTypes.string,
  hovering: PropTypes.bool,
  important: PropTypes.bool,
  isHiddenCheckBox: PropTypes.bool,
  labels: PropTypes.array,
  letters: PropTypes.string,
  mailbox: PropTypes.string,
  multiselect: PropTypes.bool,
  onCheckItem: PropTypes.func,
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
