import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';
import { Event, addEvent, removeEvent } from '../utils/electronEventInterface';

const MESSAGE_DURATION = 5000;
const DELAY_TO_CLEAR_MESSAGE = 500;

class MessageWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action: undefined,
      actionHandlerKey: undefined,
      description: undefined,
      type: undefined,
      priority: undefined,
      params: {},
      displayMessage: false
    };

    this.clearTimeouts();
    addEvent(Event.DISPLAY_MESSAGE, this.handleDisplayMessageEvent);
  }

  render() {
    const {
      action,
      description,
      displayMessage,
      type
    } = this.getDataByPropsOrEvent();
    return (
      <Message
        action={action}
        description={description}
        displayMessage={displayMessage}
        onClickAction={this.handleClickAction}
        type={type}
      />
    );
  }

  componentWillUnmount() {
    this.clearTimeouts();
    removeEvent(Event.DISPLAY_MESSAGE, this.handleDisplayMessageEvent);
  }

  handleDisplayMessageEvent = ({
    action,
    type,
    description,
    actionHandlerKey,
    priority,
    params
  }) => {
    const isDisplayingMessage = this.state.displayMessage;
    const hasHigherPriority = priority >= this.state.priority;
    if (!isDisplayingMessage || hasHigherPriority) {
      this.setMessageState({
        action,
        type,
        description,
        actionHandlerKey,
        priority,
        params
      });
    }
  };

  setMessageState = ({
    action,
    type,
    description,
    actionHandlerKey,
    priority,
    params
  }) => {
    const newState = {
      action,
      actionHandlerKey,
      description,
      params,
      priority,
      type,
      displayMessage: true
    };
    this.setState(newState, () => {
      this.hideMessageTimeout = setTimeout(() => {
        this.hideMessage();
      }, MESSAGE_DURATION);
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

  clearTimeouts = () => {
    clearTimeout(this.hideMessageTimeout);
    clearTimeout(this.clearMessageTimeout);
  };
}

MessageWrapper.propTypes = {
  action: PropTypes.string,
  actionHandlerKey: PropTypes.string,
  description: PropTypes.string,
  displayMessage: PropTypes.bool,
  onExecuteMessageAction: PropTypes.func,
  params: PropTypes.object,
  type: PropTypes.number
};

export default MessageWrapper;
