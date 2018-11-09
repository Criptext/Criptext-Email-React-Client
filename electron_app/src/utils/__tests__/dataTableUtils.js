/* eslint-env node, jest */
const { formContactsRow } = require('./../dataTableUtils.js');

describe('data table utils:', () => {
  it('form contacts row', () => {
    const contacts = [
      'Gianni <gianni@criptext.com>',
      '<erikaaa@criptext.com> <Erika@criptext.com>',
      'Pedro@criptext.com'
    ];
    const state = formContactsRow(contacts);
    expect(state).toMatchSnapshot();
  });
});
