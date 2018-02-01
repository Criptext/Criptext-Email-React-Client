import { connect } from 'react-redux';
import { loadEmails, loadThreads } from '../actions';
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
  const emailIds = thread ? thread.get('emails') : null;
  return emailsMapToList(emails, emailIds);
};

const mapStateToProps = state => {
  const thread = state.get('activities').get('selectedThread');
  const emailIds = getEmails(state.get('emails'), thread);
  return {
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
