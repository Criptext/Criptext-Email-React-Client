import { EmailStatus } from './const';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { LabelType } from './electronInterface';

export const addCollapseDiv = (htmlString, key) => {
  const regexTag = /<blockquote|criptext_quote/;
  const matches = htmlString.match(regexTag);
  if (matches) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const blockquote =
      doc.getElementsByClassName('criptext_quote')[0] ||
      doc.getElementsByTagName('blockquote')[0];
    const i = document.createElement('i');
    i.className = 'icon-dots';
    const div = document.createElement('div');
    div.className = 'div-collapse';
    div.appendChild(i);
    div.setAttribute('id', `div-collapse-${key}`);
    blockquote.parentElement.insertBefore(div, blockquote);
    blockquote.style.display = 'none';
    blockquote.setAttribute('id', `blockquote-${key}`);
    return doc.documentElement.innerHTML;
  }
  return htmlString;
};

export const compareEmailDate = (emailA, emailB) =>
  emailA.date < emailB.date ? -1 : emailA.date > emailB.date ? 1 : 0;

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
