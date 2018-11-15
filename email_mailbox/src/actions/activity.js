import { Activity } from './types';

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
