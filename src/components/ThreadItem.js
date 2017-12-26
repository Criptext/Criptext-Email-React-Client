import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadView from './ThreadView';
import * as TimeUtils from '../utils/TimeUtils';
import * as UserUtils from '../utils/UserUtils';

const getThreadClass = (thread, threadPos, selectedThread) => {
  if (threadPos === selectedThread) {
    return 'thread-selected';
  } else if (thread.unread && threadPos !== selectedThread) {
    return 'thread-unread';
  }
  return 'thread-read';
};

const mapStateToProps = (state, myProps) => {
  const selectedThread = myProps.selectedThread;
  const thread = myProps.thread.toObject();
  const myThread = {
    ...thread,
    header: UserUtils.parseContact(thread.sender).name,
    date: TimeUtils.defineTimeByToday(thread.lastEmailDate)
  }
  return {
    class: getThreadClass(thread, myProps.myIndex, selectedThread),
    thread: myThread
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectThread: threadPosition => {
      dispatch(actions.selectThread(threadPosition));
    }
  };
};

const ThreadItem = connect(mapStateToProps, mapDispatchToProps)(ThreadView);

export default ThreadItem;