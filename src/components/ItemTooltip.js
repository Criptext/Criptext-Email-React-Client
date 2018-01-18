import React from 'react';
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

export default ItemTooltip;
