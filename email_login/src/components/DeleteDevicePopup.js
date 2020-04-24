import React from 'react';
import PropTypes from 'prop-types';
import DeleteDeviceItem from './DeleteDeviceItem';
import Button, { ButtonType } from './Button';
import { defineLastDeviceActivity } from './../utils/TimeUtils';
import string from '../lang';
import './deletedevicepopup.scss';

const DeleteDevicePopup = props => (
  <div id={'popup-delete-device'} className="popup-content">
    <div className="popup-title">
      <h1>{props.title}</h1>
    </div>
    <div className="popup-paragraph">
      <p>
        {string.formatString(
          string.popUp.deleteDevices[1].message,
          props.devicesToRemove
        )}
      </p>
    </div>
    <Content {...props} />
    <div className="popup-buttons">
      <Button
        onClick={props.onClickCancel}
        text={props.textButtonCancel}
        type={ButtonType.POPUP_CANCEL}
      />
      <Button
        onClick={props.onClickConfirm}
        state={props.confirmButtonState}
        text={props.textButtonConfirm}
        type={ButtonType.POPUP_CONFIRM}
      />
    </div>
  </div>
);

const Content = props => {
  return (
    <div className="popup-items">
      <div className="popup-scroll">
        <ul>
          {props.devices.map((device, index) => {
            const lastActivity = device.lastActivity.date
              ? defineLastDeviceActivity(device.lastActivity.date)
              : string.over_time;
            return (
              <DeleteDeviceItem
                id={index}
                key={index}
                checked={device.checked}
                deviceType={device.deviceType}
                lastActivity={lastActivity}
                name={device.name}
                onClick={props.onClickDeviceItem}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
};

Content.propTypes = {
  devices: PropTypes.array,
  onClickDeviceItem: PropTypes.func,
  paragraph: PropTypes.string
};

DeleteDevicePopup.propTypes = {
  confirmButtonState: PropTypes.number,
  devicesToRemove: PropTypes.number,
  onClickCancel: PropTypes.func,
  onClickConfirm: PropTypes.func,
  textButtonCancel: PropTypes.string,
  textButtonConfirm: PropTypes.string,
  title: PropTypes.string
};

export const PopupTypes = {
  PASSWORD: 'PASSWORD',
  LIST_DEVICES: 'LIST_DEVICES',
  REQUEST_DELETE: 'REQUEST_DELETE'
};

export default DeleteDevicePopup;
