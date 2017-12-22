import { combineReducers } from 'redux';
import threads from './thread';
import users from './user';
import activities from './activity';

export default combineReducers({
  threads,
  users,
  activities
});
