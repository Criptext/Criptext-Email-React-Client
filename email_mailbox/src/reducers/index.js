import { combineReducers } from 'redux-immutable';
import reduceReducers from 'reduce-reducers';
import activities from './activity';
import contacts from './contacts';
import emails from './emails';
import files from './files';
import labels from './labels';
import feeditems from './feeditems';
import suggestions from './suggestions';
import threads from './threads';
import { crossReducer } from './crossReducer';

const combinedReducers = combineReducers({
  activities,
  contacts,
  emails,
  files,
  feeditems,
  labels,
  suggestions,
  threads
});

const rootReducer = reduceReducers(combinedReducers, crossReducer);
export default rootReducer;
