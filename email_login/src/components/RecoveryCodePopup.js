import React from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonType } from './Button';
import string from '../lang';
import './recoverycodepopup.scss';

const { recoveryCode } = string.popUp;

const RecoveryCodePopup = props => (
  <div id={'popup-recovery-code'} className="popup-content">
    <div className="popup-title">
      <h1>{recoveryCode.title}</h1>
    </div>
    <Content {...props} />
    <div className="popup-buttons">
      <Button
        onClick={props.onClickCancel}
        text={recoveryCode.buttons.cancel}
        type={ButtonType.POPUP_CANCEL}
      />
      <Button
        onClick={props.onClickConfirm}
        text={recoveryCode.buttons.confirm}
        type={ButtonType.POPUP_CONFIRM}
        state={props.validateButtonState}
      />
    </div>
  </div>
);

const Content = props => (
  <div className="popup-items">
    <p>
      {string.formatString(
        props.codeAlreadySent ? recoveryCode.alreadySent : recoveryCode.message,
        <b>{props.recoveryEmail || ''}</b>
      )}
    </p>
    <div>
      <input
        className="recovery-code-input"
        type="text"
        value={props.valueInputCode}
        onChange={props.onInputCodeChange}
        onKeyDown={props.onKeyDown}
      />
    </div>
    <div className="recovery-code-input-error">
      {props.errorInputCode && (
        <span className="popup-error">{props.errorInputCode}</span>
      )}
    </div>
  </div>
);

// eslint-disable-next-line fp/no-mutation
Content.propTypes = {
  codeAlreadySent: PropTypes.bool,
  errorInputCode: PropTypes.string,
  onKeyDown: PropTypes.func,
  onInputCodeChange: PropTypes.func,
  recoveryEmail: PropTypes.string,
  validateButtonState: PropTypes.number,
  valueInputCode: PropTypes.string
};

// eslint-disable-next-line fp/no-mutation
RecoveryCodePopup.propTypes = {
  onClickCancel: PropTypes.func,
  onClickConfirm: PropTypes.func
};

export default RecoveryCodePopup;
