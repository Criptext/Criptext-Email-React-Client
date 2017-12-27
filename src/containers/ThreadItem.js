import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadItemView from '../components/ThreadItem';
import randomcolor from 'randomcolor';
import * as TimeUtils from '../utils/TimeUtils';
import * as UserUtils from '../utils/UserUtils';

const getThreadClass = (thread, threadPos, selectedThread) => {
  if (threadPos === selectedThread) {
    return 'thread-selected';
  } else if (thread.get('unread') && threadPos !== selectedThread) {
    return 'thread-unread';
  }
  return 'thread-read';
};

const getCapitalLetters = name => {
  const names = name.split(' ');
  const firstName = names[0].charAt(0);
  if (names.length > 1) {
    return firstName + names[1].charAt(0);
  }
  return firstName;
};

const buildThreadUsers = contacts => {
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
  }... (${contacts.length})`;
};

const mapStateToProps = (state, myProps) => {
  const selectedThread = myProps.selectedThread;
  const thread = myProps.thread;
  const contacts = UserUtils.parseAllContacts(thread.get('participants'));
  const letters = getCapitalLetters(contacts[0].name);
  const myThread = thread.merge({
    letters: letters,
    header: buildThreadUsers(contacts),
    date: TimeUtils.defineTimeByToday(thread.get('lastEmailDate'))
  });
  return {
    class: getThreadClass(thread, myProps.myIndex, selectedThread),
    thread: myThread,
    color: randomcolor({
      seed: contacts[0].email,
      luminosity: 'dark'
    })
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectThread: threadPosition => {
      dispatch(actions.selectThread(threadPosition));
    }
  };
};

const ThreadItem = connect(mapStateToProps, mapDispatchToProps)(ThreadItemView);

export default ThreadItem;
