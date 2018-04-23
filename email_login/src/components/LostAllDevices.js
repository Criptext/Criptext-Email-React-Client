import React from 'react';
import PropTypes from 'prop-types';
import './lostAllDevices.css';

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
          onKeyUp={props.validator}
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
          className="button-lost"
          onClick={ev => props.handleSubmit(ev)}
          disabled={props.disabled}
        >
          <span>Confirm</span>
        </button>
      </div>
    </form>
  </div>
);

renderHeader.propTypes = {
  toggleLostAllDevices: PropTypes.func
};

renderForm.propTypes = {
  onChangeField: PropTypes.func,
  validator: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleForgot: PropTypes.func,
  disabled: PropTypes.bool,
  values: PropTypes.object
};

export default LostAllDevices;
