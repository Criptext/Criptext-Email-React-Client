import React from 'react';
import PropTypes from 'prop-types';
import './message.scss';

const Message = props => (
  <div className={`message-wrapper ${defineMessageStatus(props)}`}>
    <div className="message-container">{renderMessageType(props)}</div>
  </div>
);

const defineMessageStatus = props =>
  props.displayMessage ? 'displayed' : 'hidden';

const renderMessageType = props => {
  if (
    props.type === MessageType.ADVICE ||
    props.type === MessageType.SUGGESTION ||
    props.type === MessageType.SUCCESS ||
    props.type === MessageType.ERROR ||
    props.type === MessageType.ESTABLISH ||
    props.type === MessageType.ANNOUNCEMENT
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
          <button onClick={props.onClickAction}>
            <span>{props.action}</span>
            <i className="icon-arrow-right" />
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
    default:
      break;
  }
};

const MessageType = {
  ADVICE: 1,
  SUGGESTION: 2,
  QUESTION: 3,
  SUCCESS: 4,
  ERROR: 5,
  ESTABLISH: 6,
  ANNOUNCEMENT: 7
};

renderMessageType.propTypes = {
  type: PropTypes.number
};

MessageStandard.propTypes = {
  action: PropTypes.string,
  description: PropTypes.string,
  onClickAction: PropTypes.func,
  onClickClose: PropTypes.func,
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
export { Message as default, MessageType };
