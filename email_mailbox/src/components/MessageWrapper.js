import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Message, { MessageType } from './Message';
import { Event, addEvent, removeEvent } from '../utils/electronEventInterface';
import { messagePriorities } from '../data/message';

const MESSAGE_DURATION = 5000;
const QUESTION_DURATION = 5 * 60 * 1000;
const DELAY_TO_CLEAR_MESSAGE = 500;

class MessageWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action: undefined,
      actionHandlerKey: undefined,
      acceptHandlerKey: undefined,
      denyHandlerKey: undefined,
      description: undefined,
      type: undefined,
      priority: undefined,
      params: {},
      displayMessage: false
    };

    this.clearTimeouts();
    addEvent(Event.DISPLAY_MESSAGE, this.handleDisplayMessageEvent);
    addEvent(Event.OPEN_THREAD, this.handleOpenThreadEvent);
  }

  render() {
    const {
      action,
      ask,
      description,
      displayMessage,
      type
    } = this.getDataByPropsOrEvent();
    return (
      <Message
        {...this.props}
        action={action}
        ask={ask}
        description={description}
        displayMessage={displayMessage}
        onClickAction={this.handleClickAction}
        onClickAcceptOption={this.handleClickAcceptOption}
        onClickDenyOption={this.handleClickDenyOption}
        onClickClose={this.handleClickClose}
        type={type}
      />
    );
  }

  componentWillUnmount() {
    this.clearTimeouts();
    removeEvent(Event.DISPLAY_MESSAGE, this.handleDisplayMessageEvent);
    removeEvent(Event.OPEN_THREAD, this.handleOpenThreadEvent);
  }

  handleDisplayMessageEvent = ({
    action,
    ask,
    type,
    description,
    actionHandlerKey,
    acceptHandlerKey,
    denyHandlerKey,
    priority,
    params
  }) => {
    const isDisplayingMessage = this.state.displayMessage;
    const hasHigherPriority = priority >= this.state.priority;
    const { isUpdateAvailable } = this.props;
    if (!isUpdateAvailable && (!isDisplayingMessage || hasHigherPriority)) {
      this.setMessageState({
        action,
        ask,
        type,
        description,
        actionHandlerKey,
        acceptHandlerKey,
        denyHandlerKey,
        priority,
        params
      });
    }
  };

  setMessageState = ({
    action,
    ask,
    type,
    description,
    actionHandlerKey,
    acceptHandlerKey,
    denyHandlerKey,
    priority,
    params
  }) => {
    const newState = {
      action,
      ask,
      actionHandlerKey,
      acceptHandlerKey,
      denyHandlerKey,
      description,
      params,
      priority,
      type,
      displayMessage: true
    };
    this.setState(newState, () => {
      const isImportantMessage =
        ask ||
        priority === messagePriorities.HIGH ||
        type === MessageType.ANNOUNCEMENT;
      const duration = isImportantMessage
        ? QUESTION_DURATION
        : MESSAGE_DURATION;
      this.hideMessageTimeout = setTimeout(() => {
        this.hideMessage();
      }, duration);
    });
  };

  getDataByPropsOrEvent = () => {
    const displayByPropsOrEvent =
      this.state.displayMessage || this.props.displayMessage;
    const typeByPropsOrEvent = this.state.type || this.props.type;
    const descriptionByPropsOrEvent =
      this.state.description || this.props.description;
    const actionByPropsOrEvent = this.state.action || this.props.action;
    return {
      action: actionByPropsOrEvent,
      ask: this.state.ask,
      description: descriptionByPropsOrEvent,
      displayMessage: displayByPropsOrEvent,
      type: typeByPropsOrEvent
    };
  };

  hideMessage = () => {
    this.setState({ displayMessage: false }, () => {
      this.clearMessageTimeout = setTimeout(() => {
        this.clearMessageState();
      }, DELAY_TO_CLEAR_MESSAGE);
    });
  };

  handleClickClose = () => {
    if (this.props.isUpdateAvailable) {
      this.props.onClickClose();
    } else {
      this.hideMessage();
    }
  };

  clearMessageState = () => {
    if (this.clearMessageTimeout) {
      this.setState({
        action: undefined,
        actionHandlerKey: undefined,
        description: undefined,
        params: {},
        type: undefined
      });
    }
  };

  handleClickAction = () => {
    const actionHandlerKey =
      this.state.actionHandlerKey || this.props.actionHandlerKey;
    const params = this.state.params || this.props.params;
    this.props.onExecuteMessageAction(actionHandlerKey, params);
  };

  handleClickAcceptOption = async () => {
    const acceptKey = this.state.acceptHandlerKey;
    const params = this.state.params;
    this.hideMessage();
    this.clearTimeouts();
    return await this.props.onExecuteMessageAction(acceptKey, params);
  };

  handleClickDenyOption = async () => {
    const denyKey = this.state.denyHandlerKey;
    const params = this.state.params;
    this.hideMessage();
    this.clearTimeouts();
    await this.props.onExecuteMessageAction(denyKey, params);
  };

  clearTimeouts = () => {
    clearTimeout(this.hideMessageTimeout);
    clearTimeout(this.clearMessageTimeout);
  };

  handleOpenThreadEvent = async ({ threadId }) => {
    await this.props.onOpenThreadInMailbox({ threadId });
  };
}

MessageWrapper.propTypes = {
  action: PropTypes.string,
  actionHandlerKey: PropTypes.string,
  description: PropTypes.string,
  displayMessage: PropTypes.bool,
  isUpdateAvailable: PropTypes.bool,
  onClickClose: PropTypes.func,
  onExecuteMessageAction: PropTypes.func,
  onExportDatabase: PropTypes.func,
  onOpenThreadInMailbox: PropTypes.func,
  onUploadDatabase: PropTypes.func,
  params: PropTypes.object,
  type: PropTypes.number
};

export default MessageWrapper;
