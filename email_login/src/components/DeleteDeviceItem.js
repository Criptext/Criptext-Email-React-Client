import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './deletedeviceitem.scss';

const DeleteDeviceItem = props => (
  <li
    className={defineClassComponent(props.checked)}
    onClick={ev => props.onClick(ev, props.id)}
  >
    <div>
      <div className="checkmark-container reverse">
        <span className={defineClassCheckbox(props.checked)} />
      </div>
      <div className="device-type-icon">
        <i className={defineDeviceType(props.deviceType)} />
      </div>
      <div className={'device-description'}>
        <strong>{props.name}</strong>
        <span>
          <b>{string.last_activity}</b>: {props.lastActivity}
        </span>
      </div>
    </div>
  </li>
);

const defineClassComponent = checked => {
  const classChecked = 'checkbox-item-checked';
  return `checkbox-item ${checked ? classChecked : ''}`;
};

const defineClassCheckbox = checked => {
  return checked ? `checkmark checkmark-checked` : `checkmark`;
};

const defineDeviceType = type => {
  if (type > 1 && type < 4) {
    return 'icon-mobile';
  }
  return 'icon-desktop';
};

// eslint-disable-next-line fp/no-mutation
DeleteDeviceItem.propTypes = {
  checked: PropTypes.bool,
  deviceType: PropTypes.number,
  id: PropTypes.number,
  lastActivity: PropTypes.string,
  name: PropTypes.string,
  onClick: PropTypes.func
};

export default DeleteDeviceItem;
