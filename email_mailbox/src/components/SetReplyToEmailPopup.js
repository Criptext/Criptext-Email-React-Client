import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './setreplytoemailpopup.scss';

const replyToText = string.popups.set_reply_to.paragraph;

const SetReplyToEmailPopup = props => {
  return (
    <div id="set-reply-to-popup-content" className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.set_reply_to.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{replyToText}</p>
      </div>
      <div className="popup-inputs">
        <SetReplyToPopupInput
          value={props.setReplyToInput.email}
          onChangeValue={props.onChangeInputValueOnSetReplyTo}
          hasError={props.setReplyToInput.hasError}
          errorMessage={props.setReplyToInput.errorMessage}
        />
      </div>
      <SetReplyToEmailPopupButtons {...props} />
    </div>
  );
};

const SetReplyToPopupInput = ({
  value,
  onChangeValue,
  hasError,
  errorMessage
}) => (
  <div className="popup-input">
    <input
      type="email"
      value={value}
      onChange={ev => onChangeValue(ev)}
      placeholder={string.popups.set_reply_to.input.email.placeholder}
    />
    <InputErrorMessage
      hasError={hasError}
      errorMessage={errorMessage}
      value={value}
    />
  </div>
);

const InputErrorMessage = ({ hasError, errorMessage, value }) => {
  const shouldRenderMessage =
    hasError && errorMessage.length > 0 && value.length > 0;
  return shouldRenderMessage && <span>{errorMessage}</span>;
};

const SetReplyToEmailPopupButtons = props => (
  <div className="popup-buttons">
    <button
      className="button-a popup-cancel-button"
      onClick={props.onTogglePopup}
    >
      <span>{string.popups.set_reply_to.cancelButtonLabel}</span>
    </button>
    <button
      className="button-a popup-confirm-button"
      onClick={props.onConfirmSetReplyTo}
      disabled={props.isDisabledSetReplyToSubmitButton}
    >
      <span>{string.popups.set_reply_to.confirmButtonLabel}</span>
    </button>
  </div>
);

SetReplyToPopupInput.propTypes = {
  value: PropTypes.string,
  onChangeValue: PropTypes.func,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string
};

SetReplyToEmailPopupButtons.propTypes = {
  onTogglePopup: PropTypes.func,
  onConfirmSetReplyTo: PropTypes.func,
  isDisabledSetReplyToSubmitButton: PropTypes.bool
};

SetReplyToEmailPopup.propTypes = {
  setReplyToInput: PropTypes.object,
  onChangeInputValueOnSetReplyTo: PropTypes.func
};

export default SetReplyToEmailPopup;
