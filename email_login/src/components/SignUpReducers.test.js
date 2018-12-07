import { check, gen, property } from 'testcheck';

import { toBeConfirmed, optionallyEmpty } from './SignUpSymbols';
import { createStore } from './SignUpStore';
import {
  checkUsername,
  handleCheckUsernameIOError,
  updateForm
} from './SignUpReducers';
import * as ErrorMsgs from './SignUpErrorMsgs';

const defaultState = createStore();
const stateFrom = ({ values, errors }) => ({
  ...defaultState,
  values: { ...defaultState.values, ...values },
  errors: { ...defaultState.errors, ...errors }
});

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
          case 410: {
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
      }),
      { numTests: 800 }
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
      }),
      { numTests: 800 }
    );

    if (result !== true) {
      console.error(shrunk);
      throw result;
    }
  });
});

describe('handleCheckUsernameIOError', () => {
  it('sets appropriate error to username and clears the field', () => {
    const prevState = updateForm(defaultState, {
      itemName: 'username',
      itemValue: 'tester'
    });
    const newState = handleCheckUsernameIOError(prevState, {
      newUsername: 'tester'
    });

    expect(newState.values.username).toEqual('');
    expect(newState.errors.username).toEqual(ErrorMsgs.USERNAME_UNCERTAIN);
  });

  it('does nothing if error was thrown for a different username', () => {
    const prevState = updateForm(defaultState, {
      itemName: 'username',
      itemValue: 'tester'
    });
    const newState = handleCheckUsernameIOError(prevState, {
      newUsername: 'teste'
    });

    expect(newState).toBe(prevState);
  });
});

describe('updateForm', () => {
  it('clears the error set by handleCheckUsernameIOError', () => {
    const state1 = updateForm(defaultState, {
      itemName: 'username',
      itemValue: 'tester'
    });
    const state2 = handleCheckUsernameIOError(state1, {
      newUsername: 'tester'
    });
    const state3 = updateForm(state2, { itemName: 'username', itemValue: 't' });

    expect(state3.values.username).toEqual('t');
    expect(state3.errors.username).toEqual(ErrorMsgs.USERNAME_INVALID);
  });

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
    errors: { password: undefined, confirmpassword: undefined }
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
      expect(newState.values.password).toEqual(input);
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
      expect(newState.values.confirmpassword).toEqual(input);
      expect(newState.errors.confirmpassword).toEqual(error);
    }
  );

  it.each`
    input                      | error
    ${'gabriel'}               | ${ErrorMsgs.EMAIL_INVALID}
    ${'gabriel@io'}            | ${ErrorMsgs.EMAIL_INVALID}
    ${''}                      | ${optionallyEmpty}
    ${'gabriel@gmail.com'}     | ${undefined}
    ${'vv22-_ga.Eom@live.com'} | ${undefined}
  `('With email: $input sets error: $error', ({ input, error }) => {
    const newState = updateForm(stateWithMatchingPasswords, {
      itemName: 'recoveryemail',
      itemValue: input
    });
    expect(newState.values.recoveryemail).toEqual(input);
    expect(newState.errors.recoveryemail).toEqual(error);
  });

  it('"checks" terms of service box correctly', () => {
    const newState = updateForm(defaultState, {
      itemName: 'acceptterms',
      itemValue: true
    });
    expect(newState.values.acceptterms).toBe(true);
    expect(newState.errors.acceptterms).toBeUndefined();
  });

  it('"unchecks" terms of service box correctly', () => {
    const checkedToSState = {
      ...defaultState,
      values: { ...defaultState.values, acceptterms: true },
      errors: { ...defaultState.errors, acceptterms: undefined }
    };
    const newState = updateForm(checkedToSState, {
      itemName: 'acceptterms',
      itemValue: false
    });
    expect(newState.values.acceptterms).toBe(false);
    expect(newState.errors.acceptterms).toBeUndefined();
  });
});
