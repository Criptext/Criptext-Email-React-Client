import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EmailStatus } from './../utils/const';
import CustomCheckbox, { CustomCheckboxStatus } from './CustomCheckbox';
import { replaceMatches } from './../utils/ReactUtils';
import { replaceAllOccurrences } from './../utils/StringUtils';
import AvatarImage from './AvatarImage';
import string from '../lang';
import './threaditem.scss';

class ThreadItem extends Component {
  render() {
    const {
      checked,
      isDraft,
      isSecure,
      thread,
      onSelectThread,
      labels,
      recipients
    } = this.props;
    const visibleStyle = this.getStyleVisibilityByMultiselect(checked);
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
        <div className="thread-item-content">
          {this.renderFirstColumn()}
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
            {thread.emailIds.length > 1 && (
              <div className={'thread-item-emails-size'}>
                <span>{thread.emailIds.length}</span>
              </div>
            )}
          </div>
          <div className="thread-item-status">
            {this.renderThreadStatus(thread.status)}
          </div>
          <div className="thread-item-labels">
            {this.renderLabels(labels, thread.id)}
            <div
              className={`thread-item-subject ${this.defineThreadSubjectClass()}`}
            >
              <span>{this.renderSubject()}</span>
            </div>
            <div
              className={`thread-preview ${this.defineThreadPreviewClass()}`}
            >
              {this.renderMultipleSpaces(4)}
              <span>{this.renderPreview()}</span>
            </div>
          </div>
          <div className="thread-item-details" style={visibleStyle}>
            {this.renderFileExist(thread.fileTokens)}
            {this.renderSecure(isSecure)}
          </div>
          <div className="thread-item-date" style={visibleStyle}>
            <span>{thread.date}</span>
          </div>
        </div>
        {this.renderMenu()}
      </div>
    );
  }

  defineThreadPreviewClass = () => {
    const { isUnsend, isEmpty } = this.props;
    if (isUnsend) {
      return 'thread-preview-unsent';
    } else if (isEmpty) {
      return 'thread-preview-empty';
    }
    return '';
  };

  defineThreadSubjectClass = () => {
    const { hasNoSubject } = this.props;
    return hasNoSubject ? 'thread-subject-empty' : '';
  };

  getStyleVisibilityByMultiselect = checked => {
    if (!checked) {
      return null;
    }

    return {
      visibility: 'visible'
    };
  };

  handleCheck = value => {
    this.props.onCheckItem(
      this.props.thread.threadId || this.props.thread.uniqueId,
      CustomCheckboxStatus.toBoolean(value)
    );
  };

  handleClickMoveToTrash = ev => {
    ev.stopPropagation();
    this.props.onClickMoveToTrash();
  };

  handleToggleFavorite = ev => {
    ev.stopPropagation();
    this.props.onToggleFavorite(this.props.isStarred);
  };

  renderFirstColumn = () => {
    const classComponent = `thread-item-icon-option ${
      !this.props.isHiddenCheckBox || this.props.hovering
        ? 'show-option'
        : 'show-avatar'
    }`;
    return (
      <div
        className={classComponent}
        onMouseEnter={this.props.onRegionEnter}
        onMouseLeave={this.props.onRegionLeave}
      >
        <CustomCheckbox
          status={CustomCheckboxStatus.fromBoolean(this.props.checked)}
          onCheck={this.handleCheck}
        />
        <div className="thread-letters">
          <AvatarImage
            key={this.props.avatarUrl}
            avatarUrl={this.props.avatarUrl}
            letters={this.props.letters}
            color={this.props.color}
          />
        </div>
      </div>
    );
  };

  renderDraftText = () => (
    <span className="draft-status">{string.labelsItems.draft}</span>
  );

  renderThreadStatus = status => {
    switch (status) {
      case EmailStatus.SENT:
        return <i className="icon-checked status-sent" />;
      case EmailStatus.DELIVERED:
        return <i className="icon-double-checked status-delivered" />;
      case EmailStatus.READ:
        return <i className="icon-double-checked status-opened" />;
      case EmailStatus.SENDING:
        return <i className="icon-time status-sending" />;
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
        {labels.length > 1 && this.renderMoreLabels(labels, threadId)}
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
    const preview = replaceAllOccurrences(this.props.preview, '\n', ' ');
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

  renderSecure = isSecure => {
    if (isSecure) return <i className="icon-secure" />;
    return null;
  };

  renderMenu = () => {
    if (this.props.checked) {
      return null;
    }

    const threadId = this.props.thread.id;

    return (
      <div className="thread-label-option">
        <HoverMenuItem
          targetId={`starred${threadId}`}
          tip={
            this.props.isStarred
              ? string.mailbox.starred
              : string.mailbox.not_starred
          }
          icon="icon-star-fill"
          myClass={this.props.isStarred ? 'thread-label-mark' : ''}
          onClick={this.handleToggleFavorite}
          onMouseEnterItem={this.props.onMouseEnterItem}
          onMouseLeaveItem={this.props.onMouseLeaveItem}
        />
        {this.props.isVisibleMoveToTrash && (
          <HoverMenuItem
            targetId={`remove${threadId}`}
            tip={string.mailbox.move_to_trash}
            icon="icon-trash"
            onClick={this.handleClickMoveToTrash}
            onMouseEnterItem={this.props.onMouseEnterItem}
            onMouseLeaveItem={this.props.onMouseLeaveItem}
          />
        )}
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
  avatarUrl: PropTypes.string,
  color: PropTypes.string,
  checked: PropTypes.bool,
  hasNoSubject: PropTypes.bool,
  hovering: PropTypes.bool,
  isDraft: PropTypes.bool,
  isEmpty: PropTypes.bool,
  isHiddenCheckBox: PropTypes.bool,
  isSecure: PropTypes.bool,
  isStarred: PropTypes.bool,
  isVisibleMoveToTrash: PropTypes.bool,
  isUnsend: PropTypes.bool,
  labels: PropTypes.array,
  letters: PropTypes.string,
  mailbox: PropTypes.object,
  onCheckItem: PropTypes.func,
  onClickMoveToTrash: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  onMouseEnterItem: PropTypes.func,
  onMouseLeaveItem: PropTypes.func,
  onRegionEnter: PropTypes.func,
  onRegionLeave: PropTypes.func,
  onSelectThread: PropTypes.func,
  preview: PropTypes.string,
  recipients: PropTypes.string,
  searchParams: PropTypes.object,
  thread: PropTypes.object
};

export default ThreadItem;
