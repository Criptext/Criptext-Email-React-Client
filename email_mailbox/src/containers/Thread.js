import { connect } from 'react-redux';
import { loadEmails } from '../actions';
import ThreadView from '../components/Thread';
import { List, Map } from 'immutable';

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

const defineLabels = (labels, labelIds) => {
  const result = labelIds.toArray().map(labelId => {
    return labels.get(labelId.toString()).toObject();
  });

  return result ? result : [];
};

const mapStateToProps = (state, ownProps) => {
  const thread = getThread(state.get('threads'), ownProps.threadId);
  const emails = getEmails(state.get('emails'), thread);
  const labels = defineLabels(state.get('labels'), thread.get('labels'));
  return {
    emails,
    labels,
    thread
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadEmails: threadId => {
      dispatch(loadEmails(threadId));
    }
  };
};

const Thread = connect(mapStateToProps, mapDispatchToProps)(ThreadView);

export default Thread;
