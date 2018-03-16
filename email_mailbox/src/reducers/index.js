import { combineReducers } from 'redux-immutable';
import threads from './thread';
import contacts from './contacts';
import activities from './activity';
import emails from './emails';
import labels from './labels';
import feeds from './feeds';
import suggestions from './suggestions';

export default combineReducers({
  activities,
  contacts,
  emails,
  feeds,
  labels,
  suggestions,
  threads
});
