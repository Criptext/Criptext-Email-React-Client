import { User } from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case User.ADD_BATCH: {
      return {
        ...state,
        ...action.users
      };
    }
    case User.ADD: {
      const email = action.user.email.toString();
      return {
        ...state,
        [email]: action.user
      };
    }
    default:
      return state;
  }
};
