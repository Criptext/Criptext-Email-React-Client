import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadItemWrapper from '../components/ThreadItemWrapper';
import { Label } from '../utils/ConstUtils';

const getThreadClass = (thread, threadPos, selectedThread) => {
  if (thread.get('unread') && threadPos !== selectedThread) {
    return thread.get('selected') ? 'thread-unread-selected' : 'thread-unread';
  }
  return thread.get('selected') ? 'thread-read-selected' : 'thread-read';
};

const mapStateToProps = (state, ownProps) => {
  const selectedThread = ownProps.selectedThread;
  const thread = ownProps.thread;
  return {
    myClass: getThreadClass(thread, ownProps.myIndex, selectedThread),
    thread: thread,
    color: thread.get('color'),
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
      dispatch(actions.removeThread(threadId));
    },
    onStarClick: () => {
      const thread = ownProps.thread;
      if (thread.get('labels').contains(Label.STARRED)) {
        dispatch(actions.removeThreadLabel(thread.get('id'), Label.STARRED));
      } else {
        dispatch(actions.addThreadLabel(thread.get('id'), Label.STARRED));
      }
    },
    onImportantClick: () => {
      const thread = ownProps.thread;
      if (thread.get('labels').contains(Label.IMPORTANT)) {
        dispatch(actions.removeThreadLabel(thread.get('id'), Label.IMPORTANT));
      } else {
        dispatch(actions.addThreadLabel(thread.get('id'), Label.IMPORTANT));
      }
    }
  };
};

const ThreadItem = connect(mapStateToProps, mapDispatchToProps)(
  ThreadItemWrapper
);

export default ThreadItem;
