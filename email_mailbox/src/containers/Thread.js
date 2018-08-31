import { connect } from 'react-redux';
import {
  addLabelIdThread,
  loadEmails,
  removeLabelIdThread,
  sendOpenEvent
} from '../actions';
import ThreadView from '../components/Thread';
import { LabelType } from '../utils/electronInterface';

const getEmails = (emails, thread) => {
  const emailIds = thread ? thread.get('emailIds') : null;
  return emailIds
    ? emails.size
      ? emailIds
          .toArray()
          .filter(emailId => emails.get(String(emailId)))
          .map(emailId => {
            return emails.get(String(emailId)).toJS();
          })
      : []
    : [];
};

const getThread = (threads, threadId) => {
  return threads.find(thread => {
    return thread.get('threadId') === threadId;
  });
};

const getThreadFromSuggestions = (suggestions, threadId) => {
  return suggestions.get('threads').find(thread => {
    return thread.get('threadId') === threadId;
  });
};

const defineLabels = (labels, labelIds) => {
  const labelIdsFiltered = labelIds.filter(
    labelId => labelId !== LabelType.sent.id
  );
  const result = labelIdsFiltered
    .toArray()
    .map(labelId => {
      const label = labels.get(labelId.toString());
      return label ? label.toObject() : null;
    })
    .filter(item => item !== null);

  return result ? result : [];
};

const createReadableThread = thread => {
  const subject = thread.get('subject');
  return thread
    .set('subject', subject.length === 0 ? '(No Subject)' : subject)
    .toJS();
};

const mapStateToProps = (state, ownProps) => {
  const thread =
    getThread(state.get('threads'), ownProps.threadIdSelected) ||
    getThreadFromSuggestions(
      state.get('suggestions'),
      ownProps.threadIdSelected
    );
  const emails = getEmails(state.get('emails'), thread);
  const labelIds =
    LabelType[ownProps.mailboxSelected].id === LabelType.inbox.id
      ? thread.get('allLabels')
      : thread.get('labels');
  const labels = defineLabels(state.get('labels'), labelIds);
  const starred = thread.get('allLabels').contains(LabelType.starred.id);
  const threadReadable = createReadableThread(thread);
  return {
    emails,
    labels,
    starred,
    thread: threadReadable
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadEmails: threadId => {
      return dispatch(loadEmails(threadId));
    },
    onRemoveLabelIdThread: (threadId, labelId) => {
      return dispatch(removeLabelIdThread(threadId, labelId));
    },
    onToggleStar: (threadId, isStarred) => {
      const labelId = LabelType.starred.id;
      if (isStarred) {
        dispatch(removeLabelIdThread(threadId, labelId));
      } else {
        dispatch(addLabelIdThread(threadId, labelId));
      }
    },
    onUpdateUnreadEmails: thread => {
      const { allLabels, threadId } = thread;
      if (allLabels.includes(LabelType.inbox.id)) {
        dispatch(sendOpenEvent(threadId));
      }
    }
  };
};

const Thread = connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadView);

export default Thread;
