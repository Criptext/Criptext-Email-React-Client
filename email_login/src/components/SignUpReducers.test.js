import { check, gen, property } from 'testcheck';

import { toBeConfirmed } from './SignUpSymbols';
import { createStore } from './SignUpStore';
import { checkUsername, updateForm } from './SignUpReducers';
import * as ErrorMsgs from './SignUpErrorMsgs';

const defaultState = createStore();
const stateFrom = ({ values, errors }) => ({
  ...defaultState,
  values: { ...defaultState.values, ...values },
  errors: { ...defaultState.errors, ...errors }
});

//const usernameSetState = stateFrom({ values: { username: 'tester' } });

describe('checkUsername', () => {
  it('if username has NOT changed by the time response arrives, updates username with the received status code', () => {
    const username = 'tester';
    const prevState = stateFrom({
      values: { username },
      errors: { username: undefined }
    });
    const { result, shrunk } = check(
      property(gen.intWithin(200, 599), status => {
        const newState = checkUsername(prevState, {
          status,
          newUsername: username
        });

        switch (status) {
          case 200: {
            expect(newState.errors.username).toBeUndefined();
            break;
          }
          case 400: {
            expect(newState.errors.username).toEqual(ErrorMsgs.USERNAME_EXISTS);
            break;
          }
          case 422: {
            expect(newState.errors.username).toEqual(
              ErrorMsgs.USERNAME_INVALID
            );
            break;
          }
          default: {
            expect(newState.errors.username).toEqual(
              expect.stringContaining('' + status)
            );
          }
        }
      })
    );

    if (result !== true) {
      console.error(shrunk);
      throw result;
    }
  });
  it('if newUsername has changed by the time response arrives, returns the same state', () => {
    const username = 'tester1';
    const prevState = stateFrom({
      values: { username },
      errors: { username: undefined }
    });
    const { result, shrunk } = check(
      property(gen.intWithin(200, 599), status => {
        const newState = checkUsername(prevState, {
          status,
          newUsername: 'tester'
        });

        expect(newState).toBe(prevState);
      })
    );

    if (result !== true) {
      console.error(shrunk);
      throw result;
    }
  });
});

describe('updateForm', () => {
  it.each`
    input                             | error
    ${'yi'}                           | ${ErrorMsgs.USERNAME_INVALID}
    ${'joe'}                          | ${toBeConfirmed}
    ${'verylongnamethatisnotallowed'} | ${ErrorMsgs.USERNAME_INVALID}
    ${'sebastian.caceres'}            | ${toBeConfirmed}
    ${'carlos1996'}                   | ${toBeConfirmed}
    ${'1jeff'}                        | ${toBeConfirmed}
    ${'0'}                            | ${ErrorMsgs.USERNAME_INVALID}
  `('with username input $input sets error: $error', ({ input, error }) => {
    const newState = updateForm(defaultState, {
      itemName: 'username',
      itemValue: input
    });
    expect(newState.errors.username).toEqual(error);
  });

  it.each`
    input        | error
    ${'Gabriel'} | ${undefined}
    ${'A'}       | ${undefined}
    ${'1995'}    | ${undefined}
    ${''}        | ${ErrorMsgs.FULLNAME_INVALID}
    ${'愛'}      | ${undefined}
  `('with full name input $input sets error: $error', ({ input, error }) => {
    const newState = updateForm(defaultState, {
      itemName: 'fullname',
      itemValue: input
    });
    expect(newState.errors.fullname).toEqual(error);
  });

  it('only allows passwords of at least 8 chars', () => {
    const { result, shrunk } = check(
      property(gen.string, password => {
        const newState = updateForm(defaultState, {
          itemName: 'password',
          itemValue: password
        });
        expect(newState.errors.confirmpassword).toBe(toBeConfirmed);

        if (password.length < 8) {
          expect(newState.errors.password).toBe(ErrorMsgs.PASSWORD_INVALID);
          return;
        }

        expect(newState.errors.password).toBeUndefined();
      })
    );

    if (result !== true) {
      console.error(shrunk);
      throw result;
    }
  });

  const stateWithMatchingPasswords = stateFrom({
    values: { password: 'SecurePassword', confirmpassword: 'SecurePassword' },
    error: { password: undefined, confirmpassword: undefined }
  });

  it.each`
    input                | error
    ${'SecurePassword1'} | ${ErrorMsgs.PASSWORD_NOMATCH}
    ${'SecurePasswor'}   | ${ErrorMsgs.PASSWORD_NOMATCH}
    ${'SecurePassword'}  | ${undefined}
  `(
    'once password is set twice, updating password field with $input throws error $error in confirmpassword',
    ({ input, error }) => {
      const newState = updateForm(stateWithMatchingPasswords, {
        itemName: 'password',
        itemValue: input
      });
      expect(newState.errors.confirmpassword).toEqual(error);
    }
  );

  it.each`
    input                | error
    ${'SecurePassword1'} | ${ErrorMsgs.PASSWORD_NOMATCH}
    ${'SecurePasswor'}   | ${ErrorMsgs.PASSWORD_NOMATCH}
    ${'SecurePassword'}  | ${undefined}
  `(
    'once password is set twice, updating confirmpassword field with $input throws error $error in confirmpassword',
    ({ input, error }) => {
      const newState = updateForm(stateWithMatchingPasswords, {
        itemName: 'confirmpassword',
        itemValue: input
      });
      expect(newState.errors.confirmpassword).toEqual(error);
    }
  );
});
