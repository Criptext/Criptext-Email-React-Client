import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';
import { Event, addEvent } from '../utils/electronEventInterface';

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
      params: {},
      displayMessage: false
    };

    addEvent(
      Event.DISPLAY_MESSAGE,
      ({ action, type, description, actionHandlerKey, params }) => {
        if (!this.state.displayMessage) {
          const newState = {
            action,
            actionHandlerKey,
            description,
            params,
            type,
            displayMessage: true
          };
          this.setState(newState, () => {
            setTimeout(() => this.hideMessage(), MESSAGE_DURATION);
          });
        }
      }
    );
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

  getDataByPropsOrEvent = () => {
    const displayByPropsOrEvent =
      this.props.displayMessage || this.state.displayMessage;
    const typeByPropsOrEvent = this.props.type || this.state.type;
    const descriptionByPropsOrEvent =
      this.props.description || this.state.description;
    const actionByPropsOrEvent = this.props.action || this.state.action;
    return {
      action: actionByPropsOrEvent,
      description: descriptionByPropsOrEvent,
      displayMessage: displayByPropsOrEvent,
      type: typeByPropsOrEvent
    };
  };

  hideMessage = () => {
    this.setState({ displayMessage: false }, () => {
      setTimeout(() => this.clearMessageState(), DELAY_TO_CLEAR_MESSAGE);
    });
  };

  clearMessageState = () => {
    this.setState({
      action: undefined,
      actionHandlerKey: undefined,
      description: undefined,
      params: {},
      type: undefined
    });
  };

  handleClickAction = () => {
    const actionHandlerKey =
      this.props.actionHandlerKey || this.state.actionHandlerKey;
    const params = this.props.params || this.state.params;
    this.props.onExecuteMessageAction(actionHandlerKey, params);
  };
}

MessageWrapper.propTypes = {
  action: PropTypes.string,
  actionHandlerKey: PropTypes.string,
  description: PropTypes.string,
  displayMessage: PropTypes.bool,
  onExecuteMessageAction: PropTypes.func,
  params: PropTypes.object,
  type: PropTypes.string
};

export default MessageWrapper;
