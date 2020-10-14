import React from 'react';
import SetupCover from '../setup/SetupCover';
import PropTypes from 'prop-types';
import './pindisplay.scss';
import string from '../../lang';

const { display } = string.pin;

const PinDisplay = props => (
  <SetupCover
    topButton={display.keep}
    bottomButton={display.own}
    title={display.title}
    onClickTopButton={() => {
      props.onGoTo('save');
    }}
    onClickBotButton={() => {
      props.onGoTo('set');
    }}
    onGoBack={props.onGoBack}
  >
    <div className="pin-display">
      <div className="pin-display-subtitle">
        <span>{display.subtitle}</span>
      </div>
      <div className="pin-display-pin">
        <span>{props.storeData.defaultPin}</span>
      </div>
    </div>
  </SetupCover>
);

PinDisplay.propTypes = {
  storeData: PropTypes.object,
  onGoTo: PropTypes.func,
  onGoBack: PropTypes.func
};

export default PinDisplay;
