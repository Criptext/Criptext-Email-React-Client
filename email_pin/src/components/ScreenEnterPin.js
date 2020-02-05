import React from 'react';
import PropTypes from 'prop-types';
import EnterPin from './EnterPin';
import EnterRecoveryKey from './EnterRecoveryKey';

export const step = {
  ENTER_PIN: 1,
  ENTER_RECOVERY_KEY: 2
};

const ScreenEnterPin = props => {
  switch (props.currentStep) {
    case step.ENTER_PIN:
      return (
        <EnterPin
          pin={props.recoveredPin}
          onClickOpen={props.onClickOpen}
          onClickForgotPin={props.onClickForgotPin}
        />
      );
    case step.ENTER_RECOVERY_KEY:
      return <EnterRecoveryKey onClickSetPin={props.onClickSetPin} />;
    default:
      return null;
  }
};

ScreenEnterPin.propTypes = {
  currentStep: PropTypes.number,
  onClickForgotPin: PropTypes.func,
  onClickOpen: PropTypes.func,
  onClickSetPin: PropTypes.func,
  recoveredPin: PropTypes.string
};

export default ScreenEnterPin;
