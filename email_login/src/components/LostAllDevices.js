import React from 'react';
import PropTypes from 'prop-types';
import { appDomain } from '../utils/const';
import string from './../lang';
import './lostAllDevices.scss';
import PopupHOC from './PopupHOC';
import LoginPopup from './LoginPopup';

const { passwordLogin } = string;

const ResetPasswordPopup = PopupHOC(LoginPopup);

const LostAllDevices = props => (
  <div className="lost">
    {props.popupContent && <ResetPasswordPopup onDismiss={props.onDismissPopup} {...props.popupContent}/>}
    {renderHeader(props)}
    {renderSubHeader(props)}
    {renderForm(props)}
  </div>
);

const renderHeader = props => (
  <div className="header">
    <div className="button-section">
      <button className="back-button" onClick={props.toggleLostAllDevices}>
        <i className="icon-back" />
      </button>
    </div>
    <div className="criptext-logo">
      <div className="icon" />
    </div>
  </div>
);

const renderSubHeader = props => (
  <div className="subheader">
    <div className="sub-logo">
      <div className="sub-icon" />
    </div>
    <div className="sub-text">
      {props.hasTwoFactorAuth ? (
        <p>{passwordLogin.sectionTitleTwoFactorAuth}</p>
      ) : (
        <p>{passwordLogin.sectionTitleSignIn}</p>
      )}
      <p>{`${props.values.username}@${appDomain}`}</p>
    </div>
  </div>
);

const renderForm = props => (
  <div className="form">
    <form autoComplete="off">
      <div className="label-password">
        <input
          type="password"
          name="password"
          placeholder={passwordLogin.form.passwordInputPlaceholder}
          value={props.values.password}
          onChange={props.onChangeField}
          disabled={props.isLoading}
          autoFocus={true}
        />
        <span className="forgot-password" onClick={props.handleForgot}>
          {passwordLogin.form.forgotLabel}
        </span>
      </div>
      <div className="button">
        <button
          className={`button-lost ${
            props.isLoading ? 'button-is-loading' : ''
          }`}
          onClick={props.onCLickSignInWithPassword}
          disabled={props.disabled}
        >
          {props.isLoading ? renderLoadingContent() : renderBaseContent(props)}
        </button>
      </div>
    </form>
  </div>
);

const renderBaseContent = props => {
  return props.hasTwoFactorAuth ? (
    <span className="button-text">{passwordLogin.buttons.nextLabel}</span>
  ) : (
    <span className="button-text">{passwordLogin.buttons.confirmLabel}</span>
  );
};

const renderLoadingContent = () => (
  <div className="loading">
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
);

// eslint-disable-next-line fp/no-mutation
renderHeader.propTypes = {
  toggleLostAllDevices: PropTypes.func
};

// eslint-disable-next-line fp/no-mutation
renderSubHeader.propTypes = {
  hasTwoFactorAuth: PropTypes.bool,
  values: PropTypes.object
};

// eslint-disable-next-line fp/no-mutation
renderForm.propTypes = {
  onChangeField: PropTypes.func,
  validator: PropTypes.func,
  onCLickSignInWithPassword: PropTypes.func,
  handleForgot: PropTypes.func,
  disabled: PropTypes.bool,
  values: PropTypes.object,
  isLoading: PropTypes.bool
};

// eslint-disable-next-line fp/no-mutation
renderBaseContent.propTypes = {
  hasTwoFactorAuth: PropTypes.bool
};

export default LostAllDevices;
