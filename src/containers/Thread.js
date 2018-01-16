import { connect } from 'react-redux';
import { loadEmails, loadThreads } from '../actions';
import ThreadView from '../components/Thread';
import { List, Map } from 'immutable';

const emailsMapToList = (emailsMap, emailIds) => {
  let result =
    emailsMap.size === 0 || !emailIds
      ? List()
      : emailIds.map(emailId => {
          return emailsMap.get(emailId.toString()) || Map();
        });
  return result;
};

const getEmails = (emails, thread, threadId) => {
  let emailIds = thread ? thread.get('emails') : null;
  return emailsMapToList(emails, emailIds);
};

const getThread = (threads, threadId) => {
  return threads.find(thread => {
    return thread.get('id') === threadId;
  });
};

const mapStateToProps = (state, ownProps) => {
  const threadId = Number(ownProps.match.params.threadId);
  const thread = getThread(state.get('threads'), threadId);
  const emailIds = getEmails(state.get('emails'), thread, threadId);
  return {
    threadId,
    thread,
    labels: thread ? thread.get('labels') : [],
    emails: emailIds
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadEmails: () => {
      if (!ownProps.emails) {
        dispatch(loadThreads(dispatch));
      }
      dispatch(loadEmails(dispatch));
    }
  };
};

const Thread = connect(mapStateToProps, mapDispatchToProps)(ThreadView);

export default Thread;
