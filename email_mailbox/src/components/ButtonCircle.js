import React from 'react';
import PropTypes from 'prop-types';
import HeaderActionTooltip from './HeaderActionTooltip';
import './buttoncircle.scss';

const ButtonCircle = props => (
  <div
    className="button-circle"
    id={props.targetName}
    onClick={props.onClick}
    data-tip
    data-for={props.targetName}
  >
    <i className={props.icon} />
    {props.enableTip && (
      <HeaderActionTooltip target={props.targetName} tip={props.tip} />
    )}
  </div>
);

ButtonCircle.propTypes = {
  icon: PropTypes.string,
  enableTip: PropTypes.bool,
  onClick: PropTypes.func,
  tip: PropTypes.string,
  targetName: PropTypes.string
};

export default ButtonCircle;
