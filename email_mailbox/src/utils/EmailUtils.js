import { EmailStatus } from './const';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { LabelType } from './electronInterface';

export const compareEmailDate = (emailA, emailB) => {
  const dateA = new Date(emailA.date);
  const dateB = new Date(emailB.date);

  if (dateA.getTime() > dateB.getTime()) {
    return 1;
  }
  if (dateA.getTime() < dateB.getTime()) {
    return -1;
  }
  return 0;
};

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

export const defineRejectedLabels = labelId => {
  switch (labelId) {
    case LabelType.allmail.id:
      return [LabelType.spam.id, LabelType.trash.id, LabelType.draft.id];
    case LabelType.spam.id:
      return [LabelType.trash.id];
    case LabelType.trash.id:
      return [LabelType.spam.id];
    default:
      return [LabelType.spam.id, LabelType.trash.id];
  }
};
