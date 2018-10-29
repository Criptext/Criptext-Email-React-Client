/*eslint-env node, jest */
require('./utils.js');
const { getComputerName } = require('../../../email_login/src/ipc.js');
jest.mock('@criptext/electron-better-ipc/renderer');

describe('getComputerName', () => {
  it('calls the correct system call to deliver a result', async () => {
    const res = await getComputerName();
    expect(res).toEqual(expect.any(String));
  });
});
