import { Thread } from '../actions/types';
import { Map, Set, List } from 'immutable';
import * as TimeUtils from '../utils/TimeUtils';
import {
  parseAllContacts,
  getCapitalLetters,
  buildParticipantsColumnString
} from '../utils/UserUtils';
import randomcolor from 'randomcolor';

export default (state = List([]), action) => {
  switch (action.type) {
    case Thread.SELECT: {
      const newThreads = state
        .map(thread => thread.set('selected', false))
        .update(
          state.findIndex(function(item) {
            return item.get('id') === action.selectedThread;
          }),
          function(item) {
            return item.set('unread', false);
          }
        );
      return newThreads;
    }
    case Thread.ADD_BATCH: {
      const threads = action.threads.map(thread => {
        const contacts = parseAllContacts(thread.participants);
        return Map(thread).merge({
          labels: Set(thread.labels),
          emails: List(thread.emails),
          letters: getCapitalLetters(contacts[0].name),
          header: buildParticipantsColumnString(contacts),
          date: TimeUtils.defineTimeByToday(thread.lastEmailDate),
          color: randomcolor({
            seed: contacts[0].email,
            luminosity: 'bright'
          })
        });
      });

      return state.concat(
        List(threads).sort((t1, t2) => {
          return t2.get('lastEmailDate') - t1.get('lastEmailDate');
        })
      );
    }
    case Thread.MULTISELECT: {
      return state.update(
        state.findIndex(function(item) {
          return item.get('id') === action.selectedThread;
        }),
        function(item) {
          return item.set('selected', action.value);
        }
      );
    }
    case Thread.ADD_THREAD_LABEL: {
      return state.update(
        state.findIndex(function(thread) {
          return thread.get('id') === action.targetThread;
        }),
        function(thread) {
          return thread.update('labels', labels => {
            return labels.add(action.label);
          });
        }
      );
    }
    case Thread.ADD_THREADS_LABEL: {
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        return thread.update('labels', labels => labels.add(action.label));
      });
    }
    case Thread.REMOVE_LABEL: {
      return state.update(
        state.findIndex(function(thread) {
          return thread.get('id') === action.targetThread;
        }),
        function(thread) {
          return thread.update('labels', labels => {
            return labels.delete(action.label);
          });
        }
      );
    }
    case Thread.REMOVE_THREADS_LABEL: {
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        return thread.update('labels', labels => labels.delete(action.label));
      });
    }
    case Thread.READ_THREADS: {
      return state.map(thread => {
        if (!action.threadsIds.includes(thread.get('id'))) {
          return thread;
        }
        return thread.set('unread', !action.read);
      });
    }
    case Thread.UNREAD_FILTER: {
      return state.map(thread => thread.set('selected', false));
    }
    case Thread.REMOVE: {
      return state.filterNot(
        thread => thread.get('id') === action.targetThread
      );
    }
    case Thread.DESELECT_THREADS: {
      return state.map(thread => thread.set('selected', false));
    }
    case Thread.SELECT_THREADS: {
      return state.map(thread => thread.set('selected', true));
    }
    case Thread.MOVE_THREADS: {
      return state.filterNot(thread => {
        return action.threadsIds.includes(thread.get('id'));
      });
    }
    case Thread.SEARCH_THREADS: {
      return state.filter(thread => {
        const {
          from,
          to,
          subject,
          text,
          hasAttachments,
          mailbox,
          plain
        } = action.params;
        const mySubject = thread.get('subject');
        const myUsers = thread.get('participants');
        const myHasAtt = thread.get('totalAttachments') > 0;
        const myPreview = thread.get('preview');
        const myLabels = thread.get('labels');
        if (plain) {
          return (
            mySubject.includes(text) ||
            myUsers.includes(text) ||
            myPreview.includes(text)
          );
        }
        return (
          mySubject.includes(subject) &&
          myUsers.includes(from) &&
          myUsers.includes(to) &&
          myHasAtt === hasAttachments &&
          (parseInt(mailbox, 10) === -1
            ? true
            : myLabels.has(parseInt(mailbox, 10))) &&
          myPreview.includes(text)
        );
      });
    }
    default:
      return state;
  }
};
