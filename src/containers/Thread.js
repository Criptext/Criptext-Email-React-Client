import { connect } from 'react-redux';
import { loadEmails, loadThreads } from '../actions';
import ThreadView from '../components/Thread';
import { List, Map } from 'immutable';

const emailList = (emailsMap, emailIds) => {
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
  let email = thread ? thread.get('emails') : null;
  return emailList(state.get('emails'), email);
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
