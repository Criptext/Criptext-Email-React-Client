import React from 'react';
import PropTypes from 'prop-types';
import './message.scss';

const Message = props => (
  <div className={defineClassComponent(props)}>
    <div className="message-container">{renderMessageType(props)}</div>
  </div>
);

const defineClassComponent = props => {
  const statusClass = props.displayMessage ? 'displayed' : 'hidden';
  return `cptx-message-wrapper ${statusClass}`;
};

const renderMessageType = props => {
  if (
    props.type === MessageType.ADVICE ||
    props.type === MessageType.SUGGESTION ||
    props.type === MessageType.SUCCESS ||
    props.type === MessageType.ERROR ||
    props.type === MessageType.ESTABLISH ||
    props.type === MessageType.ANNOUNCEMENT ||
    props.type === MessageType.REQUIREMENT
  ) {
    return <MessageStandard {...props} />;
  } else if (props.type === MessageType.QUESTION) {
    return <MessageQuestion {...props} />;
  }
  return null;
};

const MessageStandard = props => {
  const isSuggestionOrAnnouncement =
    props.type === MessageType.SUGGESTION ||
    props.type === MessageType.ANNOUNCEMENT;
  return (
    <div className={`message-content ${defineMessageClass(props.type)}`}>
      <span className="message-description">{props.description}</span>
      {!!props.action &&
        !!props.onClickAction && (
          <button
            className={defineActionClass(props.status)}
            onClick={props.onClickAction}
          >
            <span>{props.action}</span>
            {props.status === MessageActionStatus.ENABLED ? (
              <i className="icon-arrow-right" />
            ) : (
              renderLoading()
            )}
          </button>
        )}
      {isSuggestionOrAnnouncement && (
        <button className="message-close" onClick={props.onClickClose}>
          <i className="icon-exit" />
        </button>
      )}
    </div>
  );
};

const MessageQuestion = props => (
  <div className="message-content message-question">
    <span className="message-description">{props.ask}</span>
    <div className="message-buttons">
      <button onClick={() => props.onClickAcceptOption()}>
        <span>Yes</span>
      </button>
      <span>-</span>
      <button onClick={() => props.onClickDenyOption()}>
        <span>No</span>
      </button>
    </div>
  </div>
);

const renderLoading = () => (
  <div className="cptx-spinning-circle ctpx-spinning-circle-a">
    <div />
    <div />
    <div />
    <div />
  </div>
);

const defineMessageClass = type => {
  switch (type) {
    case MessageType.ADVICE:
      return 'message-advice';
    case MessageType.SUGGESTION:
      return 'message-suggestion';
    case MessageType.SUCCESS:
      return 'message-success';
    case MessageType.ERROR:
      return 'message-error';
    case MessageType.ESTABLISH:
      return 'message-establish';
    case MessageType.ANNOUNCEMENT:
      return 'message-announcement';
    case MessageType.REQUIREMENT:
      return 'message-requirement';
    default:
      break;
  }
};

const defineActionClass = status => {
  switch (status) {
    case MessageActionStatus.ENABLED:
      return 'message-action-enabled';
    case MessageActionStatus.DISABLED:
      return 'message-action-disabled';
    default:
      return 'message-action-enabled';
  }
};

export const MessageType = {
  ADVICE: 1,
  SUGGESTION: 2,
  QUESTION: 3,
  SUCCESS: 4,
  ERROR: 5,
  ESTABLISH: 6,
  ANNOUNCEMENT: 7,
  REQUIREMENT: 8
};

export const MessageActionStatus = {
  ENABLED: 0,
  DISABLED: 1
};

renderMessageType.propTypes = {
  type: PropTypes.number
};

MessageStandard.propTypes = {
  action: PropTypes.string,
  description: PropTypes.string,
  onClickAction: PropTypes.func,
  onClickClose: PropTypes.func,
  status: PropTypes.number,
  type: PropTypes.number
};

MessageQuestion.propTypes = {
  ask: PropTypes.string,
  onClickAcceptOption: PropTypes.func,
  onClickDenyOption: PropTypes.func
};

Message.propTypes = {
  message: PropTypes.object
};

export default Message;
