import { EmailStatus } from './const';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';

export const formEmailLabel = ({ emailId, labels }) => {
  return labels.map(labelId => {
    return {
      labelId,
      emailId
    };
  });
};

export const formFilesFromData = ({ files, date }) => {
  return files.map(file => {
    const { token, name, read_only, size, status, mimeType } = file;
    return {
      token,
      name,
      readOnly: read_only ? true : false,
      size,
      status: status || 0,
      date,
      mimeType
    };
  });
};

export const validateEmailStatusToSet = (prevEmailStatus, nextEmailStatus) => {
  const isAlreadyUnsent = prevEmailStatus === EmailStatus.UNSEND;
  const isAlreadyOpened = prevEmailStatus === EmailStatus.OPENED;
  return isAlreadyUnsent ? null : isAlreadyOpened ? null : nextEmailStatus;
};

export const parseSignatureHtmlToEdit = signatureHtml => {
  const blocksFromHtml = htmlToDraft(signatureHtml);
  const { contentBlocks, entityMap } = blocksFromHtml;
  const contentState = ContentState.createFromBlockArray(
    contentBlocks,
    entityMap
  );
  return EditorState.createWithContent(contentState);
};

export const parseSignatureContentToHtml = signatureContent => {
  return draftToHtml(convertToRaw(signatureContent.getCurrentContent()));
};
