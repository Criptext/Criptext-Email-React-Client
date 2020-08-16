import React, { Component } from 'react';
import SetupCover from '../setup/SetupCover';
import PropTypes from 'prop-types';
import './pindisplay.scss';
import string from '../../lang';

const { display } = string.pin;

const PinDisplay = props => (
  <SetupCover
    topButton={display.button}
    title={display.title}
    onClickTopButton={ () => { props.onGoTo('pin') } }
  >
    <div className="pin-display">
      <div className="pin-display-subtitle">
        <span>
          {display.subtitle}
        </span>
      </div>
      <div className="pin-display-pin">
        <span>
          1234
        </span>
      </div>
    </div>

  </SetupCover>
);

export default PinDisplay;
