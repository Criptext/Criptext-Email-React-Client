import { combineReducers } from 'redux-immutable';
import threads from './thread';
import users from './user';
import activities from './activity';
import emails from './emails';
import labels from './labels';
import feeds from './feeds';
import threadsSuggestions from './threadsSuggestions';

export default combineReducers({
  threads,
  threadsSuggestions,
  users,
  activities,
  emails,
  labels,
  feeds
});
