import React from 'react';
import PropTypes from 'prop-types';
import { closeLogin, minimizeLogin } from './../utils/electronInterface';
import './lostAllDevices.css';

const LostAllDevices = props => (
  <div>
    <div className="lost-title-bar">
      <span className="buttons">
        <span class="lost-close" onClick={ev => closeLogin()} />
        <span class="lost-minimize" onClick={ev => minimizeLogin()} />
      </span>
    </div>
    <div className="lost">
      {renderHeader()}
      {renderForm(props)}
    </div>
  </div>
);

const renderHeader = () => (
  <div className="header">
    <div className="logo">
      <div className="icon" />
    </div>
    <div className="text">
      <span>Confirm your identity</span>
    </div>
  </div>
);

const renderForm = props => (
  <div className="form">
    <form autoComplete="off">
      <div className="label-username">
        <label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={props.values.username}
            onChange={props.onChangeField}
            onKeyUp={props.validator}
          />
          <span>@criptext.com</span>
          <div className="clear" />
        </label>
      </div>

      <div className="label-password">
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={props.values.password}
          onChange={props.onChangeField}
          onKeyUp={props.validator}
        />
      </div>

      <div className="button">
        <button
          className="button-login"
          onClick={ev => props.handleSubmit(ev)}
          disabled={props.disabled}
        >
          <span>Log In</span>
        </button>
      </div>
    </form>
  </div>
);

renderForm.propTypes = {
  onChangeField: PropTypes.func,
  validator: PropTypes.func,
  handleSubmit: PropTypes.func,
  disabled: PropTypes.bool,
  values: PropTypes.object
};

export default LostAllDevices;
