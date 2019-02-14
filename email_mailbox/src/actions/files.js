import { File } from './types';
import { updateFilesByEmailId } from '../utils/ipc';
import { AttachItemStatus } from '../components/AttachItem';
import { defineFiles } from './../utils/FileUtils';

export const addFiles = files => {
  return {
    type: File.ADD_BATCH,
    files
  };
};

export const loadFiles = tokens => {
  return async dispatch => {
    try {
      const files = await defineFiles(tokens);
      dispatch(addFiles(files));
    } catch (e) {
      // TO DO
    }
  };
};

export const unsendEmailFiles = emailId => {
  return async dispatch => {
    try {
      const status = AttachItemStatus.UNSENT;
      const dbResponse = await updateFilesByEmailId({
        emailId,
        status
      });
      if (dbResponse) {
        dispatch(unsendEmailFilesOnSuccess({ emailId, status }));
      }
    } catch (e) {
      // To do
    }
  };
};

export const unsendEmailFilesOnSuccess = ({ emailId, status }) => {
  return {
    type: File.UNSEND_FILES,
    emailId: String(emailId),
    status
  };
};
