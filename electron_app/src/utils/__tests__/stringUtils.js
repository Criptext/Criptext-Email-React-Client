/* eslint-env node, jest */
const { getBasepathAndFilenameFromPath } = require('./../stringUtils');

describe('String Utils: ', () => {
  it('Split path in basename and filename. Unix systems', () => {
    const customPath = '/tmp/parent/child/myfile.ext';
    const expectedBasename = '/tmp/parent/child';
    const expectedFilename = 'myfile.ext';
    const { basename, filename } = getBasepathAndFilenameFromPath(customPath);
    expect(expectedBasename).toEqual(basename);
    expect(expectedFilename).toEqual(filename);
  });

  it('Split path in basename and filename. Windows', () => {
    const customPath = 'C:\\tmp\\parent\\child\\myfile.ext';
    const expectedBasename = 'C:\\tmp\\parent\\child';
    const expectedFilename = 'myfile.ext';
    const { basename, filename } = getBasepathAndFilenameFromPath(customPath);
    expect(expectedBasename).toEqual(basename);
    expect(expectedFilename).toEqual(filename);
  });

  it('No basename and filename on fake path', () => {
    const customPath = 'CTmpParentChildMyfileExt';
    const { basename, filename } = getBasepathAndFilenameFromPath(customPath);
    expect(basename).toBeUndefined();
    expect(filename).toBeUndefined();
  });
});
