/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Email from './../containers/Email';
import EmailLoading from './EmailLoading';
import ItemTooltip from './ItemTooltip';
import Label from './Label';
import Message from '../containers/Message';
import string from '../lang';
import './thread.scss';

const MIN_INDEX_TO_COLLAPSE = 3;

class Thread extends Component {
  constructor(props) {
    super(props);
    const groupedIndex =
      props.indexFirstUnread < 0
        ? props.emails.length - 1
        : props.indexFirstUnread;
    this.state = {
      groupedIndex: groupedIndex || 0,
      hoverTarget: null,
      tip: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.thread && !nextProps.thread) {
      this.props.onBackOption();
    } else if (this.props.thread.unread) {
      if (
        nextProps.emailKeysUnread.length !== this.props.emailKeysUnread.length
      ) {
        this.props.onUpdateUnreadEmails(
          nextProps.emailKeysUnread,
          nextProps.thread.threadId
        );
      }
    }
    if (
      this.props.emails.length === 0 &&
      nextProps.emails.length > this.props.emails.length
    ) {
      const groupedIndex =
        nextProps.indexFirstUnread < 0
          ? nextProps.emails.length - 1
          : nextProps.indexFirstUnread;
      this.setState({
        groupedIndex: groupedIndex || 0
      });
    }
  }

  render() {
    return (
      <div className="thread-container">
        <Message
          mailbox={this.props.mailboxSelected}
          onClickSection={this.props.onClickSection}
        />
        <div className="cptx-thread-content">
          <div className="thread-info">
            <div className="thread-info-title">
              <h1>{this.props.thread ? this.props.thread.subject : ''}</h1>
              {this.props.labels.map((label, index) => {
                return (
                  <Label
                    key={index}
                    label={label}
                    onClickDelete={this.handleRemoveLabel}
                  />
                );
              })}
            </div>
            <div
              className={`thread-starred-status ${
                this.props.starred ? 'starred-on' : 'starred-off'
              }`}
            >
              <i
                className={this.props.starred ? 'icon-star-fill' : 'icon-star'}
                onClick={() => this.handleToggleStar()}
              />
            </div>
          </div>
          <div className="cptx-thread-emails">{this.renderEmails()}</div>
        </div>
        {this.renderTooltipForEmail()}
      </div>
    );
  }

  componentDidMount() {
    if (this.props.emails.length !== this.props.thread.emailIds.length) {
      this.props.onLoadEmails(this.props.thread.emailIds);
    } else {
      this.props.onUpdateUnreadEmails(
        this.props.emailKeysUnread,
        this.props.thread.threadId
      );
    }
  }

  renderEmails = () => {
    if (!this.props.emails.length) {
      return <EmailLoading />;
    }
    const emailContainers = this.props.emails.map((email, index) => {
      const isLast = this.props.emails.length - 1 === index;
      return (
        <Email
          email={email}
          count={this.props.emails.length}
          key={email.id}
          mailboxSelected={this.props.mailboxSelected}
          onBackOption={this.props.onBackOption}
          onMouseEnterTooltip={this.handleOnMouseEnterTooltip}
          onMouseLeaveTooltip={this.handleOnMouseLeaveTooltip}
          staticOpen={isLast}
        />
      );
    });
    const index = this.state.groupedIndex;
    const collapsedEmails = index - 1;
    if (!this.props.emails.length || index <= MIN_INDEX_TO_COLLAPSE) {
      return emailContainers;
    }
    emailContainers.splice(
      1,
      collapsedEmails,
      <ExpandView
        key={-1}
        collapsedNumber={collapsedEmails}
        onExpandGroup={this.onExpandGroup}
      />
    );
    return emailContainers;
  };

  renderTooltipForEmail = () => {
    const hoverTarget = this.state.hoverTarget;
    const tip = this.state.tip;
    if (!hoverTarget || !tip) {
      return null;
    }
    return <ItemTooltip target={hoverTarget} tip={tip} />;
  };

  handleOnMouseEnterTooltip = id => {
    this.setState({
      hoverTarget: id,
      tip: string.tooltips.secure
    });
  };

  handleOnMouseLeaveTooltip = id => {
    if (id !== this.state.hoverTarget) {
      return;
    }
    this.setState({
      hoverTarget: null,
      tip: ''
    });
  };

  handleRemoveLabel = labelId => {
    this.props.onRemoveLabelIdThread(this.props.thread.threadId, labelId);
  };

  handleToggleStar = () => {
    this.props.onToggleStar(this.props.thread.threadId, this.props.starred);
  };

  onExpandGroup = () => {
    this.setState({
      groupedIndex: 0
    });
  };
}

const ExpandView = props => (
  <div className="thread-collapsed">
    <div className="thread-collapsed-clickable" onClick={props.onExpandGroup}>
      <div className="thread-collapsed-counter">{props.collapsedNumber}</div>
    </div>
  </div>
);

ExpandView.propTypes = {
  collapsedNumber: PropTypes.number,
  onExpandGroup: PropTypes.func
};

Thread.propTypes = {
  emails: PropTypes.array,
  emailKeysUnread: PropTypes.array,
  indexFirstUnread: PropTypes.number,
  labels: PropTypes.array,
  mailboxSelected: PropTypes.object,
  onBackOption: PropTypes.func,
  onClickSection: PropTypes.func,
  onLoadEmails: PropTypes.func,
  onUpdateUnreadEmails: PropTypes.func,
  onRemoveLabelIdThread: PropTypes.func,
  onToggleStar: PropTypes.func,
  starred: PropTypes.bool,
  thread: PropTypes.object
};

export default Thread;
