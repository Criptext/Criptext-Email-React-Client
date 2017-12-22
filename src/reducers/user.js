import * as Types from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case Types.User.ADD_BATCH:
      return {
        ...state,
        ...action.users
      };
    case Types.User.ADD:
      const userId = action.user.id.toString();
      return {
        ...state,
        [userId]: action.user
      };
    default:
      return state;
  }
};
