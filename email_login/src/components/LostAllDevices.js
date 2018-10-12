import React from 'react';
import PropTypes from 'prop-types';
import './lostAllDevices.scss';

const LostAllDevices = props => (
  <div className="lost">
    {renderHeader(props)}
    {renderSubHeader(props)}
    {renderForm(props)}
  </div>
);

const renderHeader = props => (
  <div className="header">
    <div className="button-section">
      <button
        className="back-button"
        onClick={ev => props.toggleLostAllDevices(ev)}
      >
        <i className="icon-back" />
      </button>
    </div>
    <div className="criptext-logo">
      <div className="icon" />
    </div>
    <div className="header-clear" />
  </div>
);

const renderSubHeader = props => (
  <div className="subheader">
    <div className="sub-logo">
      <div className="sub-icon" />
    </div>
    <div className="sub-text">
      <p>Log In</p>
      <p>{`${props.values.username}@criptext.com`}</p>
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
          placeholder="Password"
          value={props.values.password}
          onChange={props.onChangeField}
          disabled={props.isLoading}
          autoFocus={true}
        />
        <span
          className="forgot-password"
          onClick={ev => props.handleForgot(ev)}
        >
          Forgot?
        </span>
      </div>
      <div className="button">
        <button
          className={`button-lost ${
            props.isLoading ? 'button-is-loading' : ''
          }`}
          onClick={ev => props.onCLickSignInWithPassword(ev)}
          disabled={props.disabled}
        >
          {props.isLoading ? renderLoadingContent() : renderBaseContent()}
        </button>
      </div>
    </form>
  </div>
);

const renderBaseContent = () => <span className="button-text">Confirm</span>;

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

export default LostAllDevices;
