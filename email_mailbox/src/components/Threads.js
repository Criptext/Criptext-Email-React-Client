import React from 'react';
import PropTypes from 'prop-types';
import EmptyMailbox from './EmptyMailbox';
import ButtonSync from './ButtonSync';
import ItemTooltip from './ItemTooltip';
import ThreadItem from '../containers/ThreadItem';
import Message from './../containers/Message';
import PopupHOC from './PopupHOC';
import DialogPopup from './DialogPopup';
import ReactTooltip from 'react-tooltip';
import { Switch } from 'react-switch-input';
import string from './../lang';
import './threads.scss';

const EmptyTrashPopover = PopupHOC(DialogPopup);

const Threads = props => (
  <div className={defineClassComponent(props.isVisible)}>
    <Message
      isUpdateAvailable={props.isUpdateAvailable}
      mailbox={props.mailboxSelected}
      onClickSection={props.onClickSection}
      onClickClose={props.onCloseMessage}
      threadsCount={props.threads.size}
      setPopupContent={props.setPopupContent}
    />
    {props.popupContent && (
      <EmptyTrashPopover
        {...props.popupContent}
        onLeftButtonClick={props.dismissPopup}
        onRightButtonClick={props.handlePopupConfirm}
        onTogglePopup={props.dismissPopup}
        popupPosition={{ left: '45%', top: '45%' }}
        theme={'dark'}
      />
    )}
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
          {string.mailbox.all}
        </span>
        <Switch
          theme="two"
          name="unreadSwitch"
          onChange={props.onChangeSwitch}
          checked={props.switchUnreadThreadsStatus}
          disabled={props.disableSwitch}
        />
        <span className={props.switchUnreadThreadsStatus ? '' : 'disabled'}>
          {string.mailbox.unread}
        </span>
      </div>
    </div>
    <div className="threads-content" onScroll={props.onScroll}>
      <div className="threads-items">
        {props.threads.size < 1 && (
          <EmptyMailbox mailbox={props.mailboxSelected} />
        )}
        {props.threads.map((thread, index) => {
          const checked = props.threadItemsChecked.has(thread.get('uniqueId'));
          const key = `${props.mailboxSelected}-${thread.get('uniqueId')}`;
          return (
            <ThreadItem
              key={key}
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
        {props.isLoadingThreads && (
          <div className="threads-loading">
            <div />
            <div />
            <div />
            <div />
          </div>
        )}
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

const defineClassComponent = isVisible => {
  const visibleClass = !isVisible ? 'hidden' : '';
  return `threads-container ${visibleClass}`;
};

Threads.propTypes = {
  buttonSyncStatus: PropTypes.number,
  dismissPopup: PropTypes.func,
  disableSwitch: PropTypes.bool,
  handlePopupConfirm: PropTypes.func,
  hoverTarget: PropTypes.string,
  isLoadingThreads: PropTypes.bool,
  isUpdateAvailable: PropTypes.bool,
  isVisible: PropTypes.bool,
  labels: PropTypes.array,
  mailboxSelected: PropTypes.string,
  mailboxTitle: PropTypes.string,
  message: PropTypes.object,
  onChangeSwitch: PropTypes.func,
  onCheckThreadItem: PropTypes.func,
  onClickSection: PropTypes.func,
  onCloseMessage: PropTypes.func,
  onLoadEvents: PropTypes.func,
  onMouseEnterItem: PropTypes.func,
  onMouseLeaveItem: PropTypes.func,
  onScroll: PropTypes.func,
  popupContent: PropTypes.object,
  searchParams: PropTypes.object,
  setPopupContent: PropTypes.func,
  switchUnreadThreadsStatus: PropTypes.bool,
  threadItemsChecked: PropTypes.object,
  threads: PropTypes.object,
  tip: PropTypes.string
};

export default Threads;
