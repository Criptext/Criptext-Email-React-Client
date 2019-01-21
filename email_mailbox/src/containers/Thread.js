import { connect } from 'react-redux';
import {
  addLabelIdThread,
  loadEmails,
  removeLabelIdThread,
  sendOpenEvent
} from '../actions';
import ThreadView from '../components/Thread';
import { LabelType } from '../utils/electronInterface';
import { compareEmailDate } from '../utils/EmailUtils';
import { toLowerCaseWithoutSpaces } from './../utils/StringUtils';
import string from '../lang';

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
          .sort(compareEmailDate)
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
      const label = labels.get(`${labelId}`);
      if (!label) return null;
      const text = label.get('text');
      return {
        id: label.get('id'),
        color: label.get('color'),
        text:
          label.get('type') === 'system'
            ? string.labelsItems[toLowerCaseWithoutSpaces(text)]
            : text
      };
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
  const indexFirstUnread = emails.findIndex(email => email.unread);
  const emailKeysUnread = emails
    .filter(email => email.status === 3 && email.unread)
    .map(email => email.key);
  const myEmailKeysUnread = emails
    .filter(email => email.status !== 3 && email.unread)
    .map(email => email.key);
  const labelIds =
    LabelType[ownProps.mailboxSelected].id === LabelType.inbox.id
      ? thread
        ? thread.get('allLabels')
        : []
      : thread
        ? thread.get('labels')
        : [];
  const labels = thread ? defineLabels(state.get('labels'), labelIds) : [];
  const starred = thread
    ? thread.get('allLabels').contains(LabelType.starred.id)
    : undefined;
  const threadReadable = thread ? createReadableThread(thread) : undefined;
  return {
    emails,
    emailKeysUnread,
    indexFirstUnread,
    labels,
    myEmailKeysUnread,
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
    onUpdateUnreadEmails: (emailKeysUnread, myEmailKeysUnread, threadId) => {
      if (emailKeysUnread.length || myEmailKeysUnread.length) {
        const labelId = LabelType[ownProps.mailboxSelected].id;
        dispatch(
          sendOpenEvent(emailKeysUnread, myEmailKeysUnread, threadId, labelId)
        );
      }
    }
  };
};

const Thread = connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadView);

export default Thread;
