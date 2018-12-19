/* eslint-env node, jest */
import { optionallyEmpty } from './SignUpSymbols';
import { createStore } from './SignUpStore';
import { shouldDisableSubmitButton } from './SignUpModel';

jest.mock('./../utils/electronInterface');

const defaultState = createStore();
const withErrors = errors => ({
  ...defaultState,
  errors: { ...defaultState.errors, ...errors }
});

describe('shouldDisableSubmitButton', () => {
  it.each([
    [defaultState, true],
    [withErrors({ username: 'error' }), true],
    [withErrors({ password: 'error' }), true],
    [withErrors({ confirmpassword: 'error' }), true],
    [withErrors({ recoveryemail: 'error' }), true],
    [withErrors({ fullname: 'error' }), true],
    [
      withErrors({
        username: 'error',
        password: 'error',
        confirmpassword: 'error',
        recoveryemail: 'error',
        fullname: 'error'
      }),
      true
    ],
    [
      withErrors({
        username: undefined,
        password: undefined,
        fullname: undefined,
        confirmpassword: undefined,
        recoveryemail: 'error',
        acceptterms: undefined
      }),
      true
    ],
    [
      withErrors({
        username: undefined,
        password: undefined,
        fullname: undefined,
        confirmpassword: undefined,
        recoveryemail: undefined,
        acceptterms: undefined
      }),
      false
    ],
    [
      withErrors({
        username: undefined,
        password: undefined,
        fullname: undefined,
        confirmpassword: undefined,
        recoveryemail: optionallyEmpty,
        acceptterms: undefined
      }),
      false
    ]
  ])(
    'validates that state #%# is ready to submit sign up form',
    (state, isReady) => {
      expect(shouldDisableSubmitButton(state)).toBe(isReady);
    }
  );
});
