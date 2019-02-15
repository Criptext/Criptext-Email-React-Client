import { getFilesByTokens } from './ipc';

export const FileTypes = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  PDF: 'pdf',
  OFFICE_DOC: 'word',
  OFFICE_SHEET: 'excel',
  OFFICE_PPT: 'ppt',
  ZIP: 'zip',
  DEFAULT: 'file-default'
};

const officeDocTypes = [
  'msword',
  'vnd.openxmlformats-officedocument.wordprocessingml.document',
  'vnd.openxmlformats-officedocument.wordprocessingml.template',
  'vnd.ms-word.document.macroEnabled.12',
  'vnd.ms-word.template.macroEnabled.12'
];

const officeSheetTypes = [
  'vnd.ms-excel',
  'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'vnd.openxmlformats-officedocument.spreadsheetml.template',
  'vnd.ms-excel.sheet.macroEnabled.12',
  'vnd.ms-excel.template.macroEnabled.12',
  'vnd.ms-excel.addin.macroEnabled.12',
  'vnd.ms-excel.sheet.binary.macroEnabled.12'
];

const officePptTypes = [
  'vnd.ms-powerpoint',
  'vnd.openxmlformats-officedocument.presentationml.presentation',
  'vnd.openxmlformats-officedocument.presentationml.template',
  'vnd.openxmlformats-officedocument.presentationml.slideshow',
  'vnd.ms-powerpoint.addin.macroEnabled.12',
  'vnd.ms-powerpoint.presentation.macroEnabled.12',
  'vnd.ms-powerpoint.template.macroEnabled.12',
  'vnd.ms-powerpoint.slideshow.macroEnabled.12'
];

export const identifyFileType = mimetype => {
  const [type, subtype] = mimetype.split('/');
  switch (type) {
    case 'image':
      return FileTypes.IMAGE;
    case 'audio':
      return FileTypes.AUDIO;
    case 'video':
      return FileTypes.VIDEO;
    case 'text': {
      if (subtype === 'csv') return FileTypes.OFFICE_SHEET;
      return FileTypes.DEFAULT;
    }
    case 'application': {
      if (subtype === 'pdf') return FileTypes.PDF;
      if (subtype === 'zip') return FileTypes.ZIP;
      if (officeDocTypes.indexOf(subtype) > -1) return FileTypes.OFFICE_DOC;
      if (officeSheetTypes.indexOf(subtype) > -1) return FileTypes.OFFICE_SHEET;
      if (officePptTypes.indexOf(subtype) > -1) return FileTypes.OFFICE_PPT;
      return FileTypes.DEFAULT;
    }
    default:
      return FileTypes.DEFAULT;
  }
};

export const defineFiles = async tokens => {
  const response = await getFilesByTokens(tokens);
  return response.reduce(
    (result, file) => ({
      ...result,
      [file.token]: file
    }),
    {}
  );
};
