import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

const HeaderActionTooltip = props => (
  <ReactTooltip
    place="bottom"
    className="labels-tooltip"
    id={props.target}
    type="dark"
    effect="solid"
    disable={props.disable}
  >
    {props.tip}
    <div className="tooltip-tip"> </div>
  </ReactTooltip>
);

HeaderActionTooltip.propTypes = {
  disable: PropTypes.bool,
  target: PropTypes.string,
  tip: PropTypes.string
};

export default HeaderActionTooltip;
