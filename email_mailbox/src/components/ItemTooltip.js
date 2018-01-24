import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

const ItemTooltip = props => (
  <ReactTooltip
    place="top"
    className="labels-tooltip"
    id={props.target}
    type="dark"
    effect="solid"
  >
    {props.tip}
    <div className="tooltip-tip"> </div>
  </ReactTooltip>
);

ItemTooltip.propTypes = {
  target: PropTypes.string,
  tip: PropTypes.string
};

export default ItemTooltip;
