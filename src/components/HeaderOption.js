import React from 'react';
import HeaderActionTooltip from './HeaderActionTooltip';

const HeaderOption = props => (
  <div
    className={props.myClass}
    id={props.targetName}
    onClick={props.onClick}
    data-tip
    data-for={props.targetName}
  >
    <i className={props.icon} />
    {props.enableTip ? (
      <HeaderActionTooltip target={props.targetName} tip={props.tip} />
    ) : null}
  </div>
);

export default HeaderOption;
