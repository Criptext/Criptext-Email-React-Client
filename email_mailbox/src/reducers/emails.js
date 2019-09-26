import { Email } from '../actions/types';
import { fromJS, Map, Set } from 'immutable';

const emails = (state = new Map(), action) => {
  switch (action.type) {
    case Email.ADD_BATCH: {
      const emails = fromJS(action.emails);
      const batch = emails.map(email => {
        const fileTokens = email.get('fileTokens');
        const labelIds = email.get('labelIds');
        const secure = !!email.get('secure');
        const unread = !!email.get('unread');

        return email.merge({
          fileTokens: Set(fileTokens ? fileTokens.split(',') : []),
          labelIds: Set(labelIds ? labelIds.split(',').map(Number) : []),
          unread,
          secure
        });
      });
      return state.merge(batch);
    }
    case Email.MUTE: {
      const item = state.get(action.emailId);
      if (item !== undefined) {
        const prevMutedState = item.get('isMuted');
        const newItem =
          prevMutedState === 1
            ? item.set('isMuted', 0)
            : item.set('isMuted', 1);
        return state.set(action.emailId, newItem);
      }
      return state;
    }
    case Email.MARK_UNREAD: {
      const emailId = action.emailId;
      const item = state.get(`${emailId}`);
      if (item === undefined) {
        return state;
      }
      return state.set(`${emailId}`, email(item, action));
    }
    case Email.REMOVE_EMAILS: {
      const { emailIds } = action;
      if (!emailIds) {
        return state;
      }
      return state.deleteAll(emailIds);
    }
    case Email.UNSEND: {
      const { emailId, unsentDate, status } = action;
      if (
        typeof emailId !== 'string' ||
        !unsentDate ||
        typeof status !== 'number'
      ) {
        return state;
      }
      const item = state.get(emailId);
      if (!item) {
        return state;
      }
      return state.set(emailId, email(item, action));
    }
    case Email.UPDATE: {
      const emailId = action.email.id;
      if (!emailId) return state;
      const emailItem = state.get(`${emailId}`);
      if (!emailItem) return state;
      return state.set(`${emailId}`, email(emailItem, action));
    }
    case Email.UPDATE_EMAILS: {
      const emails = action.emails;
      if (!emails || !emails.length) return state;
      return emails.reduce((state, emailItem) => {
        const emailId = emailItem.id;
        const emailState = state.get(`${emailId}`);
        if (!emailState) return state;
        const action = { type: Email.UPDATE, email: emailItem };
        return state.set(`${emailId}`, email(emailState, action));
      }, state);
    }
    case Email.ADD_LABEL:
    case Email.DELETE_LABEL: {
      const emails = action.emails;
      if (!emails || !emails.length) return state;
      return emails.reduce((state, emailItem) => {
        const emailId = emailItem.id;
        if (!emailId) return state;
        const emailState = state.get(`${emailId}`);
        if (!emailState) return state;
        return state.set(`${emailId}`, email(emailState, action));
      }, state);
    }
    default:
      return state;
  }
};

const email = (state, action) => {
  switch (action.type) {
    case Email.MARK_UNREAD: {
      return state.set('unread', action.unread);
    }
    case Email.UNSEND: {
      const { unsentDate, status } = action;
      return (
        state &&
        state.merge({
          content: '',
          preview: '',
          status,
          unsentDate
        })
      );
    }
    case Email.UPDATE: {
      const { content, unread } = action.email;
      return state.merge({
        content: content || state.get('content'),
        unread: typeof unread === 'boolean' ? unread : state.get('unread')
      });
    }
    case Email.ADD_LABEL: {
      const labelIds = state.get('labelIds');
      if (!labelIds) return state;
      const newSet = new Set(action.labelsAdd);
      const mergedSet = new Set([...labelIds, ...newSet]);
      return state.set('labelIds', mergedSet);
    }
    case Email.DELETE_LABEL: {
      const labelIds = state.get('labelIds');
      if (!labelIds) return state;
      const newSet = new Set(
        Array.from(labelIds).filter(
          actualLabelId => !action.labelsDelete.includes(actualLabelId)
        )
      );

      return state.set('labelIds', newSet);
    }
    default:
      return state;
  }
};

export default emails;
