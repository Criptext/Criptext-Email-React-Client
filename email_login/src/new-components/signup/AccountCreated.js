import React, { Component } from 'react';
import SetupCover from '../setup/SetupCover';
import PropTypes from 'prop-types';
import './accountcreated.scss';
import string from '../../lang';

const { created } = string.newSignUp;

const AccountCreated = props => (
  <SetupCover
    topButton={created.button}
    title={created.title}
    onClickTopButton={() => {
      props.onNextHandle('pin');
    }}
  >
    <div className="account-created-subtitle">
      <span>{created.description}</span>
    </div>
    <div className="account-created-img" />
  </SetupCover>
);

export default AccountCreated;
