import { toBeConfirmed } from './SignUpSymbols';

export const shouldDisableSubmitButton = state => {
  return Object.values(state.errors).some(
    errMsg => (typeof errMsg === 'string') | (errMsg === toBeConfirmed)
  );
};
