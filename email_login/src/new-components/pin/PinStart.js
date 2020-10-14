import React from 'react';
import SetupCover from '../setup/SetupCover';
import PropTypes from 'prop-types';
import './pinstart.scss';
import string from '../../lang';

const { start } = string.pin;

const PinStart = props => (
  <SetupCover
    topButton={start.button}
    title={start.title}
    onClickTopButton={() => {
      props.onGoTo('pin');
    }}
  >
    <div className="pin-start-subtitle">
      <span>{start.subtitle}</span>
    </div>
  </SetupCover>
);

PinStart.propTypes = {
  onGoTo: PropTypes.func
};

export default PinStart;
