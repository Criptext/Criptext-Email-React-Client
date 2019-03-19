import { createSelector } from 'reselect';

const getFiles = state => state.get('files');

const getFileTokens = (state, props) => props.fileTokens;

const defineFiles = (files, fileTokens) => {
  if (!fileTokens) return { files: [], inlineImages: [] };
  if (!files.size) return { files: [], inlineImages: [] };
  return fileTokens.reduce(
    (result, token) => {
      const inlineImages = [...result.inlineImages];
      const filesFiltered = [...result.files];
      if (files.get(token)) {
        const file = files.get(token);
        if (file.get('cid')) {
          inlineImages.push(file.toJS());
        } else {
          filesFiltered.push(file.toJS());
        }
      }
      return { files: filesFiltered, inlineImages };
    },
    { files: [], inlineImages: [] }
  );
};

export const makeGetFiles = () => {
  return createSelector([getFiles, getFileTokens], (files, fileTokens) =>
    defineFiles(files, fileTokens)
  );
};
