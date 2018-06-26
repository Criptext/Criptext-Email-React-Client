/* eslint-env node, jest */

import fileReducer from './../files';
import * as actions from './../../actions/index';
import data from './../../../public/files.json';

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

describe('File actions:', () => {
  it('should add files', () => {
    const files = data.files.reduce(
      (result, file) => ({
        ...result,
        [file.token]: file
      }),
      {}
    );
    const action = actions.addFiles(files);
    const state = fileReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });
});
