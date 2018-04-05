import { connect } from 'react-redux';
import { loadEmails, removeThreadLabel } from '../actions';
import ThreadView from '../components/Thread';
import { List, Map } from 'immutable';
import { LabelType } from '../utils/electronInterface';

const emailsMapToList = (emailsMap, emailIds) => {
  const result =
    emailsMap.size === 0 || !emailIds
      ? List()
      : emailIds.map(emailId => {
          return emailsMap.get(emailId.toString()) || Map();
        });
  return result;
};

const getEmails = (emails, thread) => {
  const emailIds = thread ? thread.get('emailIds') : null;
  return emailsMapToList(emails, emailIds);
};

const getThread = (threads, threadId) => {
  return threads.find(thread => {
    return thread.get('id') === threadId;
  });
};

const getThreadFromSuggestions = (suggestions, threadId) => {
  return suggestions.get('threads').find(thread => {
    return thread.get('id') === threadId;
  });
};

const defineLabels = (labels, labelIds) => {
  const result = labelIds.toArray().map(labelId => {
    return labels.get(labelId.toString()).toObject();
  });

  return result ? result : [];
};

const mapStateToProps = (state, ownProps) => {
  const thread =
    getThread(state.get('threads'), ownProps.threadId) ||
    getThreadFromSuggestions(state.get('suggestions'), ownProps.threadId);
  const emails = getEmails(state.get('emails'), thread);
  let labelIds =
    LabelType[ownProps.mailbox].id === LabelType.inbox.id
      ? thread.get('allLabels')
      : thread.get('labels');
  labelIds = labelIds.filter(labelId => labelId !== LabelType.sent.id);
  const labels = defineLabels(state.get('labels'), labelIds);
  return {
    emails,
    labels,
    thread
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadEmails: threadId => {
      return dispatch(loadEmails(threadId));
    },
    onRemoveThreadLabel: (threadIdDB, labelId) => {
      const threadParams = { threadIdStore: ownProps.threadId, threadIdDB };
      return dispatch(removeThreadLabel(threadParams, labelId));
    }
  };
};

const Thread = connect(mapStateToProps, mapDispatchToProps)(ThreadView);

export default Thread;
