import React from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonType, ButtonState } from './Button';
import { appDomain } from '../utils/const';
import string from '../lang';
import './signinpassword.scss';

const { signInPassword } = string;

const SignInPassword = props => (
  <div id="section-signinpassword">
    {renderSubHeader(props)}
    {renderForm(props)}
  </div>
);

const renderSubHeader = props => (
  <div className="subheader">
    <div className="sub-logo">
      <div className="sub-icon" />
    </div>
    <div className="sub-text">
      {props.hasTwoFactorAuth ? (
        <p>{signInPassword.sectionTitleTwoFactorAuth}</p>
      ) : (
        <p>{signInPassword.sectionTitleSignIn}</p>
      )}
      <p>{defineEmailAddress(props.values.usernameOrEmailAddress)}</p>
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
          placeholder={signInPassword.form.passwordInputPlaceholder}
          value={props.values.password}
          onChange={props.onChangeField}
          disabled={defineDisabledInput(props.buttonState)}
          autoFocus={true}
        />
        <span className="forgot-password" onClick={e => props.onClickForgot(e)}>
          {signInPassword.form.forgotLabel}
        </span>
      </div>
      <div className="buttons">
        <Button
          onClick={props.onCLickSignInWithPassword}
          state={props.buttonState}
          text={defineTextButton(props.hasTwoFactorAuth)}
          type={ButtonType.BASIC}
        />
      </div>
    </form>
  </div>
);

const defineDisabledInput = state => {
  return ButtonState.LOADING === state;
};

const defineEmailAddress = usernameOrEmailAddress => {
  return usernameOrEmailAddress.includes('@')
    ? usernameOrEmailAddress
    : `${usernameOrEmailAddress}@${appDomain}`;
};

const defineTextButton = hasTwoFactorAuth => {
  return hasTwoFactorAuth
    ? signInPassword.buttons.nextLabel
    : signInPassword.buttons.confirmLabel;
};

// eslint-disable-next-line fp/no-mutation
renderSubHeader.propTypes = {
  hasTwoFactorAuth: PropTypes.bool,
  values: PropTypes.object
};

// eslint-disable-next-line fp/no-mutation
renderForm.propTypes = {
  buttonState: PropTypes.number,
  hasTwoFactorAuth: PropTypes.bool,
  onChangeField: PropTypes.func,
  onClickForgot: PropTypes.func,
  onCLickSignInWithPassword: PropTypes.func,
  values: PropTypes.object
};

export default SignInPassword;
