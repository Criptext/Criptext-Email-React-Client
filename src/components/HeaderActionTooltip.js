import React from 'react';
import ReactTooltip from 'react-tooltip';

const HeaderActionTooltip = props => <ReactTooltip
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


export default HeaderActionTooltip;







