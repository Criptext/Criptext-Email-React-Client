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

const getEmails = (state, threadId) => {
  let thread = state.get('threads').find(thread => {
    return thread.get('id') === threadId;
  });
  let emailIds = thread ? thread.get('emails') : null;
  return emailsMapToList(state.get('emails'), emailIds);
};

const mapStateToProps = (state, ownProps) => {
  return {
    emails: getEmails(state, Number(ownProps.match.params.threadId))
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
