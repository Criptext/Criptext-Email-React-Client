import React from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonType } from './Button';
import string from './../lang';
import './signin.scss';

const { signIn } = string;

const SignIn = props => renderLogin(props);

const renderLogin = props => (
  <div id="section-signin">
    {renderWelcome()}
    {renderForm(props)}
    {renderFooter(props)}
  </div>
);

const renderWelcome = () => (
  <div className="signin-welcome">
    <div className="logo">
      <div className="icon" />
    </div>
    <div className="text">
      <span>{signIn.header}</span>
    </div>
  </div>
);

const renderForm = props => (
  <div className="signin-form">
    <form autoComplete="off">
      <input
        type="text"
        name="username"
        placeholder={signIn.inputPlaceholder}
        value={props.value}
        onChange={props.onChangeField}
        autoFocus={true}
      />
      <span className="error-message">{props.errorMessage}</span>
      <div className="buttons">
        <Button
          onClick={props.onClickSignIn}
          state={props.buttonState}
          text={signIn.signInButtonLabel}
          type={ButtonType.BASIC}
        />
      </div>
    </form>
  </div>
);

const renderFooter = props => (
  <div className="signin-footer">
    <div className="signup-message">
      <span>
        {signIn.signUpMessage.text} &nbsp;
        <strong onClick={e => props.goToSignUp(e)}>
          {signIn.signUpMessage.strong}
        </strong>
      </span>
    </div>
  </div>
);

// eslint-disable-next-line fp/no-mutation
renderForm.propTypes = {
  buttonState: PropTypes.number,
  errorMessage: PropTypes.string,
  onChangeField: PropTypes.func,
  onClickSignIn: PropTypes.func,
  value: PropTypes.string
};

// eslint-disable-next-line fp/no-mutation
renderFooter.propTypes = {
  goToSignUp: PropTypes.func
};

export default SignIn;
