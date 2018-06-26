import { File } from './types';
import * as db from '../utils/electronInterface';

export const addFiles = files => {
  return {
    type: File.ADD_BATCH,
    files
  };
};

export const loadFiles = tokens => {
  return async dispatch => {
    try {
      const response = await db.getFilesByTokens(tokens);
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
