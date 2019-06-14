import React from 'react';
import PropTypes from 'prop-types';
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
      <div className="button">
        <button
          className="button-login"
          onClick={props.onClickSignIn}
          disabled={props.disabledLoginButton}
        >
          <span>{signIn.signInButtonLabel}</span>
        </button>
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
  disabledLoginButton: PropTypes.bool,
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
