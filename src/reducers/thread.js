import * as types from '../actions/ActionTypes'

export default (state = {}, action) => {
  switch(action.type){
    case types.Thread.ADD_BATCH:
      return {
        ...state,
        threads: {...action.threads}
      }
    default: 
      return state;
  }
}

