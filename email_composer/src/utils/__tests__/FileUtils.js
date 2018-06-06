/* eslint-env node, jest */

import { FILE_TYPES, identifyFileType } from './../FileUtils';

jest.mock('./../../utils/electronInterface');
jest.mock('criptext-files-sdk');

describe('Identify image files ', () => {
  it('Identify jpg files ', () => {
    const type = identifyFileType('image/jpeg');
    expect(type).toBe(FILE_TYPES.IMAGE);
  });

  it('Identify png ', () => {
    const type = identifyFileType('image/png');
    expect(type).toBe(FILE_TYPES.IMAGE);
  });

  it('Identify gif ', () => {
    const type = identifyFileType('image/gif');
    expect(type).toBe(FILE_TYPES.IMAGE);
  });
});

describe('Identify audio files ', () => {
  it('Identify mp3 files ', () => {
    const type = identifyFileType('audio/mp3');
    expect(type).toBe(FILE_TYPES.AUDIO);
  });

  it('Identify WMA files ', () => {
    const type = identifyFileType('audio/wma');
    expect(type).toBe(FILE_TYPES.AUDIO);
  });
});

describe('Identify video files ', () => {
  it('Identify mp4 files ', () => {
    const type = identifyFileType('video/mp4');
    expect(type).toBe(FILE_TYPES.VIDEO);
  });
});

describe('Identify application files ', () => {
  it('Identify PDF ', () => {
    const type = identifyFileType('application/pdf');
    expect(type).toBe(FILE_TYPES.PDF);
  });

  it('Identify Zip ', () => {
    const type = identifyFileType('application/zip');
    expect(type).toBe(FILE_TYPES.ZIP);
  });

  it('Identify office documents ', () => {
    const type = identifyFileType(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(type).toBe(FILE_TYPES.OFFICE_DOC);
  });

  it('Identify office sheets ', () => {
    const type = identifyFileType(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(type).toBe(FILE_TYPES.OFFICE_SHEET);
  });

  it('Identify csv ', () => {
    const type = identifyFileType('text/csv');
    expect(type).toBe(FILE_TYPES.OFFICE_SHEET);
  });

  it('Identify office presentations ', () => {
    const type = identifyFileType(
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );
    expect(type).toBe(FILE_TYPES.OFFICE_PPT);
  });
});

describe('Identify another files by default', () => {
  it('Identify text files ', () => {
    const type = identifyFileType('text/plain');
    expect(type).toBe(FILE_TYPES.DEFAULT);
  });
});
