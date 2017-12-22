import * as Types from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case Types.Thread.SELECT:
      return {
        ...state,
        selectedThread: action.selectedThread
      };
    default:
      return state;
  }
};
