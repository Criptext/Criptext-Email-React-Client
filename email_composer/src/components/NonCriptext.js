import React from 'react';
import Switch from 'react-switch';
import './noncriptext.css';

const NonCriptext = props => {
  return (
    <div className="non-criptext-container">
      <div className="non-criptext-content">
        <section>{renderPopUp(props)}</section>
      </div>
    </div>
  );
};

const renderPopUp = props => {
  return (
    <div className="content">
      <div className="non-criptext-title">Non-Criptext Recipient</div>
      <div className="non-criptext-label">
        <span className="text">Set a password</span>
        <span className="switch">{renderSwitch(props)}</span>
      </div>
      <div className="non-criptext-description">
        <span>This is so non-Criptext users can read your encrypted email</span>
      </div>
      {props.mode === PopUpModes.SET_PASSWORD
        ? renderForm(props)
        : renderNote()}
      {renderButtons(props)}
    </div>
  );
};

const renderSwitch = props => {
  return (
    <Switch
      id="setPasswordSwitch"
      onChange={props.onChangeSwitch}
      checked={props.mode === PopUpModes.SET_PASSWORD}
      width={28}
      height={17}
      handleDiameter={13}
      offColor="#b4b4b4"
      onColor="#0091ff"
      uncheckedIcon={false}
      checkedIcon={false}
    />
  );
};

const renderForm = props => {
  return (
    <div className="non-criptext-form">
      <input className="password" placeholder="Enter password" />
      <input className="password" placeholder="Repeat password" />
    </div>
  );
};

const renderNote = () => {
  return (
    <div className="non-criptext-note">
      <span>Note: </span>
      <span>
        This email will be sent as a normal, unencrypted email only to
        non-Criptext email addresses.
      </span>
    </div>
  );
};

const renderButtons = props => {
  return (
    <div className="non-criptext-buttons">
      <button
        className="button-send"
        onClick={() => props.onClickSendMessage()}
      >
        Send
      </button>
      <button
        className="button-cancel"
        onClick={() => props.onClickCancelSendMessage()}
      >
        Cancel
      </button>
    </div>
  );
};

const PopUpModes = {
  SET_PASSWORD: 'set-password',
  NO_PASSWORD: 'no-set-password'
};

NonCriptext.propTypes = {};

export { NonCriptext as default, PopUpModes };
