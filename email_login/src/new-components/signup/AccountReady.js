import React, { Component } from 'react';
import Button, { STYLE } from '../templates/Button';
import PropTypes from 'prop-types';

import './accountready.scss';

const AccountReady = props => (
  <div className="ready-wrapper">
    <div className="header-container">
      <h2>
        Account ready: now...
        <br />
        make it yours 😎
      </h2>
    </div>
    <div className='ready-card'> 
      <div>
        {props.name}
      </div>
      <div>
        {props.email}
      </div>
    </div>
    <Button text={"Next"} style={STYLE.CRIPTEXT} />
  </div>
);

export default AccountReady;