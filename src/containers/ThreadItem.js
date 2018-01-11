import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadWrapper from '../components/ThreadWrapper';
import randomcolor from 'randomcolor';
import * as TimeUtils from '../utils/TimeUtils';
import * as UserUtils from '../utils/UserUtils';
import { Label } from '../utils/ConstUtils';

const getThreadClass = (thread, threadPos, selectedThread) => {
  if (thread.get('unread') && threadPos !== selectedThread) {
    return thread.get('selected') ? 'thread-unread-selected' : 'thread-unread';
  }
  return thread.get('selected') ? 'thread-read-selected' : 'thread-read';
};

const getCapitalLetters = name => {
  const names = name.split(' ');
  const firstName = names[0].charAt(0);
  if (names.length > 1) {
    return firstName + names[1].charAt(0);
  }
  return firstName;
};

const buildParticipantsColumnString = contacts => {
  if (contacts.length === 1) {
    return contacts[0].name;
  }

  if (contacts.length === 2) {
    return `${contacts[0].name.split(' ')[0]}, ${
      contacts[1].name.split(' ')[0]
    }`;
  }

  return `${contacts[0].name.split(' ')[0]}, ${
    contacts[1].name.split(' ')[0]
  }... (${contacts.length - 2})`;
};

const mapStateToProps = (state, ownProps) => {
  const selectedThread = ownProps.selectedThread;
  const thread = ownProps.thread;
  const contacts = UserUtils.parseAllContacts(thread.get('participants'));
  const letters = getCapitalLetters(contacts[0].name);
  const myThread = thread.merge({
    letters: letters,
    header: buildParticipantsColumnString(contacts),
    date: TimeUtils.defineTimeByToday(thread.get('lastEmailDate'))
  });
  return {
    myClass: getThreadClass(thread, ownProps.myIndex, selectedThread),
    thread: myThread,
    color: randomcolor({
      seed: contacts[0].email,
      luminosity: 'bright'
    }),
    multiselect: state.get('activities').get('multiselect'),
    starred: thread.get('labels').contains(Label.STARRED),
    important: thread.get('labels').contains(Label.IMPORTANT),
    labels: state.get('labels')
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSelectThread: threadPosition => {
      dispatch(actions.selectThread(threadPosition));
    },
    onMultiSelect: (threadId, value) => {
      dispatch(actions.multiSelectThread(threadId, value));
    },
    onRemove: () => {
      const threadId = ownProps.thread.get('id');
      dispatch(actions.removeThread(threadId))
    },
    onStarClick: () => {
      const thread = ownProps.thread;
      if (thread.get('labels').contains(Label.STARRED)) {
        dispatch(actions.removeLabel(thread.get('id'), Label.STARRED));
      } else {
        dispatch(actions.addThreadLabel(thread.get('id'), Label.STARRED));
      }
    },
    onImportantClick: () => {
      const thread = ownProps.thread;
      if (thread.get('labels').contains(Label.IMPORTANT)) {
        dispatch(actions.removeLabel(thread.get('id'), Label.IMPORTANT));
      } else {
        dispatch(actions.addThreadLabel(thread.get('id'), Label.IMPORTANT));
      }
    }
  };
};

const ThreadItem = connect(mapStateToProps, mapDispatchToProps)(ThreadWrapper);

export default ThreadItem;
