import React from 'react';
import PropTypes from 'prop-types';
import ThreadItem from '../containers/ThreadItem';
import EmptyMailbox from './EmptyMailbox';
import { Switch } from 'react-switch-input';
import Message from './../containers/Message';
import ButtonSync from './ButtonSync';
import ItemTooltip from './ItemTooltip';
import ReactTooltip from 'react-tooltip';
import './threads.css';

const Threads = props => (
  <div className="threads-container">
    <Message
      mailbox={props.mailboxSelected}
      onClickSection={props.onClickSection}
    />
    <div className="threads-header">
      <div className="threads-header-title-container">
        <h1 className="threads-mailbox-title">{props.mailboxTitle}</h1>
        <ButtonSync
          onClick={props.onLoadEvents}
          status={props.buttonSyncStatus}
        />
      </div>
      <div className="threads-header-switch-container">
        <span className={props.switchUnreadThreadsStatus ? 'disabled' : ''}>
          All
        </span>
        <Switch
          theme="two"
          name="unreadSwitch"
          onChange={props.onChangeSwitch}
          checked={props.switchUnreadThreadsStatus}
        />
        <span className={props.switchUnreadThreadsStatus ? '' : 'disabled'}>
          Unread
        </span>
      </div>
    </div>
    <div className="threads-content" onScroll={props.onScroll}>
      <div className="threads-items">
        {props.threads.size < 1 && (
          <EmptyMailbox mailbox={props.mailboxSelected} />
        )}
        {props.threads.map((thread, index) => {
          const checked = props.threadItemsChecked.has(thread.get('id'));
          return (
            <ThreadItem
              key={index}
              myIndex={index}
              checked={checked}
              mailbox={props.mailboxSelected}
              thread={thread}
              onClickSelectedItem={props.onClickSection}
              onMouseEnterItem={props.onMouseEnterItem}
              onMouseLeaveItem={props.onMouseLeaveItem}
              searchParams={props.searchParams}
              onCheckItem={props.onCheckThreadItem}
              isHiddenCheckBox={!props.threadItemsChecked.size}
            />
          );
        })}
      </div>
    </div>
    {renderTooltipForThread(props.hoverTarget, props.tip)}
    {renderLabelsForThread(props.hoverTarget, props.labels)}
  </div>
);

const renderTooltipForThread = (hoverTarget, tip) => {
  if (!hoverTarget || !tip) {
    return null;
  }

  return <ItemTooltip target={hoverTarget} tip={tip} />;
};

const renderLabelsForThread = (hoverTarget, labels) => {
  if (!labels) {
    return null;
  }

  return (
    <ReactTooltip
      place="top"
      className="labels-tooltip"
      id={hoverTarget}
      type="dark"
      effect="solid"
    >
      {labels.map(label => {
        return (
          <div
            key={label.id}
            style={{ backgroundColor: label.color }}
            className="innerLabel"
          >
            {label.text}
          </div>
        );
      })}
      <div className="tooltip-tip"> </div>
    </ReactTooltip>
  );
};

Threads.propTypes = {
  buttonSyncStatus: PropTypes.number,
  hoverTarget: PropTypes.string,
  labels: PropTypes.array,
  mailboxSelected: PropTypes.string,
  mailboxTitle: PropTypes.string,
  message: PropTypes.object,
  onChangeSwitch: PropTypes.func,
  onCheckThreadItem: PropTypes.func,
  onClickSection: PropTypes.func,
  onLoadEvents: PropTypes.func,
  onMouseEnterItem: PropTypes.func,
  onMouseLeaveItem: PropTypes.func,
  onScroll: PropTypes.func,
  searchParams: PropTypes.object,
  switchUnreadThreadsStatus: PropTypes.bool,
  threadItemsChecked: PropTypes.object,
  threads: PropTypes.object,
  tip: PropTypes.string
};

export default Threads;
