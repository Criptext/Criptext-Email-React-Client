import { ThreadSuggestions } from '../actions/types';
import { Map, List } from 'immutable';
import * as TimeUtils from '../utils/TimeUtils';
import {
  parseAllContacts,
  buildParticipantsColumnString
} from '../utils/UserUtils';

export default (state = Map({
  threads: List([]),
  hints: List([]),
}), action) => {
  switch (action.type) {
    case ThreadSuggestions.SET_THREADS: {
      const threadsList = List(
        action.threads.map(thread => {
          const testUsers = 'Criptext Info <no-reply@criptext.com>';
          const contacts = parseAllContacts(testUsers);
          return Map(thread).merge({
            header: buildParticipantsColumnString(contacts),
            date: TimeUtils.defineTimeByToday(thread.date),
            totalAttachments: 1,
            participants: testUsers
          });
        })
      );
      const hintsList = List(action.hints)

      return state.merge({
        hints: hintsList,
        threads: threadsList
      })
    }
    default:
      return state;
  }
};
