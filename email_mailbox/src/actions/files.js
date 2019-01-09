import { File } from './types';
import * as db from '../utils/electronInterface';
import { getFilesByTokens } from '../utils/ipc';
import { AttachItemStatus } from '../components/AttachItem';

export const addFiles = files => {
  return {
    type: File.ADD_BATCH,
    files
  };
};

export const loadFiles = tokens => {
  return async dispatch => {
    try {
      const response = await getFilesByTokens(tokens);
      const files = response.reduce(
        (result, file) => ({
          ...result,
          [file.token]: file
        }),
        {}
      );
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
      const dbResponse = await db.updateFilesByEmailId({
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
