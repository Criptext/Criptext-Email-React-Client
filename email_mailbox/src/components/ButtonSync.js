import React from 'react';
import PropTypes from 'prop-types';
import './buttonsync.css';

const ButtonSync = props => (
  <button
    className={'threads-button-sync ' + defineStatusClass(props.status)}
    onClick={() => props.onClick()}
    disabled={props.status === ButtonSyncType.LOAD}
  >
    <div className="threads-sync-arrow" />
  </button>
);

const defineStatusClass = status => {
  if (status === ButtonSyncType.LOAD) {
    return 'sync-load';
  }
  return 'sync-stop';
};

ButtonSync.propTypes = {
  onClick: PropTypes.func,
  status: PropTypes.number
};

export const ButtonSyncType = {
  STOP: 0,
  LOAD: 1
};

export default ButtonSync;
