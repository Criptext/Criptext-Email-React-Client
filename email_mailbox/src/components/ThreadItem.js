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
      isDraft,
      thread,
      onRegionEnter,
      onRegionLeave,
      onSelectThread,
      labels,
      recipients
    } = this.props;
    return (
      <div
        className={
          'thread-item-container ' +
          (thread.unread ? 'thread-item-unread' : 'thread-item-read') +
          (checked ? ' thread-item-checked' : '')
        }
        onClick={() => {
          onSelectThread(thread);
        }}
      >
        <a>
          <div
            className="thread-item-contact-letters"
            onMouseEnter={onRegionEnter}
            onMouseLeave={onRegionLeave}
          >
            {this.renderFirstColumn()}
          </div>
          <div className="thread-item-recipients">
            {thread.threadId && isDraft ? (
              <span>
                {recipients}
                &nbsp;
                {this.renderDraftText()}
              </span>
            ) : isDraft ? (
              this.renderDraftText()
            ) : (
              <span>{recipients}</span>
            )}
          </div>
          <div className="thread-item-status">
            {this.renderThreadStatus(thread.status)}
          </div>
          <div className="thread-item-labels">
            {this.renderLabels(labels, thread.id)}
            <div className="thread-item-subject">
              <span>{this.renderSubject()}</span>
            </div>
            <div className="thread-preview">
              {this.renderMultipleSpaces(3)}
              <span>{this.renderPreview()}</span>
            </div>
          </div>
          <div className="thread-item-file" style={visibleStyle}>
            {this.renderFileExist(thread.fileTokens)}
          </div>
          <div className="thread-item-date" style={visibleStyle}>
            <span>{thread.date}</span>
          </div>
        </a>
        {this.renderMenu()}
      </div>
    );
  }

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

  renderDraftText = () => <span className="draft-status">Draft</span>;

  renderThreadStatus = status => {
    switch (status) {
      case EmailStatus.SENT:
        return <i className="icon-checked status-sent" />;
      case EmailStatus.DELIVERED:
        return <i className="icon-checked status-delivered" />;
      case EmailStatus.OPENED:
        return <i className="icon-checked status-opened" />;
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

  renderSubject = () => {
    const subject = this.props.thread.subject;
    if (this.props.mailbox !== 'search') {
      return subject;
    }

    return replaceMatches(this.props.searchParams.subject, subject);
  };

  renderMultipleSpaces = times => {
    return Array.from(Array(times).keys()).map(index => {
      return <span key={index}> </span>;
    });
  };

  renderPreview = () => {
    const preview = replaceAllOccurrences(this.props.thread.preview, '\n', ' ');
    if (this.props.mailbox !== 'search') {
      return preview;
    }

    return replaceMatches(this.props.searchParams.text, preview);
  };

  renderFileExist = fileTokens => {
    if (fileTokens && fileTokens.length) {
      return <i className="icon-attach" />;
    }
    return null;
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
          icon="icon-star-fill"
          myClass={this.props.isStarred ? 'thread-label-mark' : ''}
          onClick={this.onToggleFavorite}
          onMouseEnterItem={this.props.onMouseEnterItem}
          onMouseLeaveItem={this.props.onMouseLeaveItem}
        />
        {this.props.isVisibleMoveToTrash && (
          <HoverMenuItem
            targetId={`remove${threadId}`}
            tip="Move to Trash"
            icon="icon-trash"
            onClick={this.onClickMoveToTrash}
            onMouseEnterItem={this.props.onMouseEnterItem}
            onMouseLeaveItem={this.props.onMouseLeaveItem}
          />
        )}
      </div>
    );
  };

  getStyleVisibilityByMultiselect = () => {
    if (!this.props.multiselect) {
      return null;
    }

    return {
      visibility: 'visible'
    };
  };

  onCheck = value => {
    this.props.onCheckItem(
      this.props.thread.id,
      CustomCheckboxStatus.toBoolean(value)
    );
  };

  onToggleFavorite = ev => {
    ev.stopPropagation();
    this.props.onToggleFavorite();
  };

  onClickMoveToTrash = ev => {
    ev.stopPropagation();
    this.props.onClickMoveToTrash();
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
          this.props.onMouseLeaveItem(`labelstip${threadId}`);
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
      props.onMouseLeaveItem(props.targetId);
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
  onMouseLeaveItem: PropTypes.func,
  targetId: PropTypes.string,
  tip: PropTypes.string
};

ThreadItem.propTypes = {
  color: PropTypes.string,
  checked: PropTypes.bool,
  hovering: PropTypes.bool,
  important: PropTypes.bool,
  isDraft: PropTypes.bool,
  isHiddenCheckBox: PropTypes.bool,
  isStarred: PropTypes.bool,
  isVisibleMoveToTrash: PropTypes.bool,
  labels: PropTypes.array,
  letters: PropTypes.string,
  mailbox: PropTypes.string,
  multiselect: PropTypes.bool,
  onCheckItem: PropTypes.func,
  onClickMoveToTrash: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  onMouseEnterItem: PropTypes.func,
  onMouseLeaveItem: PropTypes.func,
  onRegionEnter: PropTypes.func,
  onRegionLeave: PropTypes.func,
  onSelectThread: PropTypes.func,
  recipients: PropTypes.string,
  searchParams: PropTypes.object,
  thread: PropTypes.object
};

export default ThreadItem;
