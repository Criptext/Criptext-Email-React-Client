import { connect } from 'react-redux';
import {
  addLabelIdThread,
  loadEmails,
  removeLabelIdThread,
  sendOpenEvent
} from '../actions';
import { makeGetEmails } from './../selectors/emails';
import { makeGetLabels } from './../selectors/labels';
import { makeGetThread } from './../selectors/threads';
import ThreadView from '../components/Thread';
import { LabelType } from '../utils/electronInterface';

const makeMapStateToProps = () => {
  const getEmails = makeGetEmails();
  const getLabels = makeGetLabels();
  const getThread = makeGetThread();

  const mapStateToProps = (state, ownProps) => {
    const thread = getThread(state, ownProps);
    const { emails, emailKeysUnread } = getEmails(state, {
      emailIds: thread ? thread.emailIds : []
    });
    const indexFirstUnread = emails.findIndex(email => email.unread);
    const labelIds = thread ? thread.allLabels : [];
    const labels = thread ? getLabels(state, { labelIds }) : [];
    const starred = thread
      ? thread.allLabels.includes(LabelType.starred.id)
      : undefined;
    return {
      emails,
      emailKeysUnread,
      indexFirstUnread,
      labels,
      starred,
      thread
    };
  };
  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadEmails: threadId => {
      return dispatch(loadEmails(threadId));
    },
    onRemoveLabelIdThread: (threadId, labelId) => {
      return dispatch(
        removeLabelIdThread(ownProps.mailboxSelected.id, threadId, labelId)
      );
    },
    onToggleStar: (threadId, isStarred) => {
      const labelId = LabelType.starred.id;
      if (isStarred) {
        dispatch(
          removeLabelIdThread(ownProps.mailboxSelected.id, threadId, labelId)
        );
      } else {
        dispatch(
          addLabelIdThread(ownProps.mailboxSelected.id, threadId, labelId)
        );
      }
    },
    onUpdateUnreadEmails: (emailKeysUnread, threadId) => {
      if (emailKeysUnread.length) {
        const labelId = ownProps.mailboxSelected.id;
        dispatch(sendOpenEvent(emailKeysUnread, threadId, labelId));
      }
    }
  };
};

const Thread = connect(
  makeMapStateToProps,
  mapDispatchToProps
)(ThreadView);

export default Thread;
