import * as Types from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case Types.Thread.ADD_BATCH:
      return {
        ...state,
        threads: { ...action.threads }
      };
    default:
      return state;
  }
};
