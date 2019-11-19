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
    <Content {...props} />
    <div className="popup-buttons">
      {!!props.textButtonCancel && (
        <Button
          id={props.step}
          onClick={props.onClickCancel}
          text={props.textButtonCancel}
          type={ButtonType.POPUP_CANCEL}
        />
      )}
      <Button
        id={props.step}
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
      {props.step === 1 ? (
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
      ) : (
        <div className="popup-paragraph">
          <p>{props.paragraph}</p>
          <strong>{props.note}</strong>
          {props.inputPassword && (
            <div className="popup-input">
              <input
                autoFocus={true}
                onChange={props.onChangeInputPassword}
                onKeyDown={e => props.onKeyDownInputPassword(e, props.step)}
                placeholder={props.inputPassword.placeholder}
                type={props.isInputPasswordShow ? 'text' : 'password'}
                value={props.valueInputPassword}
              />
              <i
                className={
                  props.isInputPasswordShow ? 'icon-show' : 'icon-not-show'
                }
                onClick={() => props.onClickInputPasswordIcon()}
              />
              <span className="popup-input-error">
                {props.errorInputPassword}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Content.propTypes = {
  devices: PropTypes.array,
  errorInputPassword: PropTypes.string,
  inputPassword: PropTypes.object,
  isInputPasswordShow: PropTypes.bool,
  note: PropTypes.string,
  onChangeInputPassword: PropTypes.func,
  onClickDeviceItem: PropTypes.func,
  onClickInputPasswordIcon: PropTypes.func,
  onKeyDownInputPassword: PropTypes.func,
  paragraph: PropTypes.string,
  step: PropTypes.number,
  valueInputPassword: PropTypes.string
};

DeleteDevicePopup.propTypes = {
  confirmButtonState: PropTypes.string,
  onClickCancel: PropTypes.func,
  onClickConfirm: PropTypes.func,
  step: PropTypes.number,
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
