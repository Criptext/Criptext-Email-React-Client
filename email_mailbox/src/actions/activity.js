import { Activity } from './types';

export const logout = () => {
  return {
    type: Activity.LOGOUT
  };
};

export const stopAll = () => {
  return {
    type: Activity.STOP_ALL
  };
};

export const startLoadSync = () => {
  return {
    type: Activity.START_LOAD_SYNC
  };
};

export const stopLoadSync = () => {
  return {
    type: Activity.STOP_LOAD_SYNC
  };
};

export const startLoadThread = () => {
  return {
    type: Activity.START_LOAD_THREAD
  };
};

export const stopLoadThread = () => {
  return {
    type: Activity.STOP_LOAD_THREAD
  };
};

export const setAvatarUpdatedTimestamp = timestamp => {
  return {
    type: Activity.AVATAR_UPDATED_TIMESTAMP,
    timestamp
  };
};

export const updateLoadingSync = ({ totalTask, completedTask }) => {
  return {
    type: Activity.UPDATE_LOADING_SYNC,
    totalTask,
    completedTask
  };
};

export const updateSwitchThreads = ({ checked, disabled }) => {
  return {
    type: Activity.UPDATE_SWITCH_THREADS,
    checked,
    disabled
  };
};
