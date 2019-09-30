import React from 'react';
import PropTypes from 'prop-types';
import Start from './Start';
import PinGenerated from './PinGenerated';
import PinNew from './PinNew';
import PinSaved from './PinSaved';
import Complete from './Complete';

export const step = {
  START: 1,
  PIN_GENERATED: 2,
  PIN_NEW: 3,
  PIN_SAVED: 4,
  COMPLETE: 5
};

const ScreenSignin = props => {
  switch (props.currentStep) {
    case step.START:
      return <Start onClickStart={props.onClickStart} />;
    case step.PIN_GENERATED:
      return (
        <PinGenerated
          onClickKeepIt={props.onClickKeepIt}
          onClickChangeIt={props.onClickChangeIt}
          pin={props.pin}
        />
      );
    case step.PIN_NEW:
      return <PinNew onClickSetPin={props.onClickSetPin} />;
    case step.PIN_SAVED:
      return <PinSaved pin={props.pin} onClickSavedIt={props.onClickSavedIt} />;
    case step.COMPLETE:
      return (
        <Complete
          askKeyChain={props.askKeyChain}
          pin={props.pin}
          onClickCompleteIt={props.onClickCompleteIt}
        />
      );
    default:
      return null;
  }
};

ScreenSignin.propTypes = {
  askKeyChain: PropTypes.bool,
  currentStep: PropTypes.number,
  onClickChangeIt: PropTypes.func,
  onClickCompleteIt: PropTypes.func,
  onClickKeepIt: PropTypes.func,
  onClickSavedIt: PropTypes.func,
  onClickSetPin: PropTypes.func,
  onClickStart: PropTypes.func,
  pin: PropTypes.string
};

export default ScreenSignin;
