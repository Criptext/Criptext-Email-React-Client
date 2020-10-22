import React from 'react';
import Button, { STYLE } from '../templates/Button';
import PropTypes from 'prop-types';
import string from '../../lang';

import './accountready.scss';

const { ready } = string.newSignUp;

const AccountReady = props => (
  <div className="ready-wrapper">
    <div className="header-container">
      <h2>
        {ready.title.firstLine}
        <br />
        {ready.title.secondLine}
      </h2>
    </div>
    <div className="ready-card">
      <div>{props.name}</div>
      <div>{props.email}</div>
    </div>
    <Button
      text={ready.button}
      style={STYLE.CRIPTEXT}
      onClick={() => {
        props.onNextHandle('setup');
      }}
    />
  </div>
);

AccountReady.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  onNextHandle: PropTypes.func
};

export default AccountReady;
