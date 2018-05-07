export const FILE_TYPES = {
  IMAGE: 'IMAGE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  PDF: 'PDF',
  OFFICE_DOC: 'OFFICE_DOC',
  OFFICE_SHEET: 'OFFICE_SHEET',
  OFFICE_PPT: 'OFFICE_PPT',
  ZIP: 'ZIP',
  DEFAULT: 'DEFAULT'
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
      return FILE_TYPES.IMAGE;
    case 'audio':
      return FILE_TYPES.AUDIO;
    case 'video':
      return FILE_TYPES.VIDEO;
    case 'text': {
      if (subtype === 'csv') return FILE_TYPES.OFFICE_SHEET;
      return FILE_TYPES.DEFAULT;
    }
    case 'application': {
      if (subtype === 'pdf') return FILE_TYPES.PDF;
      if (subtype === 'zip') return FILE_TYPES.ZIP;
      if (officeDocTypes.indexOf(subtype) > -1) return FILE_TYPES.OFFICE_DOC;
      if (officeSheetTypes.indexOf(subtype) > -1)
        return FILE_TYPES.OFFICE_SHEET;
      if (officePptTypes.indexOf(subtype) > -1) return FILE_TYPES.OFFICE_PPT;
      return FILE_TYPES.DEFAULT;
    }
    default:
      return FILE_TYPES.DEFAULT;
  }
};
