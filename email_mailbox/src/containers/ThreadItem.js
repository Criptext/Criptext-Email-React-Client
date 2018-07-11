import { connect } from 'react-redux';
import * as actions from './../actions/index';
import ThreadItemWrapper from '../components/ThreadItemWrapper';
import {
  composerEvents,
  LabelType,
  openEmailInComposer,
  myAccount
} from '../utils/electronInterface';
import { defineTimeByToday } from '../utils/TimeUtils';
import { getTwoCapitalLetters } from '../utils/StringUtils';
import { SectionType } from '../utils/const';
import randomcolor from 'randomcolor';

const defineLabels = (labelIds, labels, labelsToExclude) => {
  if (!labels.size) return [];
  const result = labelIds.toArray().reduce((result, labelId) => {
    if (!labelsToExclude.includes(labelId)) {
      result.push(labels.get(labelId.toString()).toObject());
    }
    return result;
  }, []);
  return result ? result : [];
};

const defineLabelsToExcludeByMailbox = currentLabelId => {
  const labelInboxId = LabelType.inbox.id;
  return currentLabelId === labelInboxId ? [LabelType.sent.id] : [];
};

const defineSubject = (subject, emailSize) => {
  const text = subject.length === 0 ? '(No Subject)' : subject;
  const emailCounter = emailSize > 1 ? ` (${emailSize})` : '';
  return `${text}${emailCounter}`;
};

const formatRecipientsForThreadItem = (recipients, currentUserName) => {
  const myFormattedRecipient = 'Me';
  let listMyselftAtEnd = false;
  const formattedRecipients = recipients.reduce((formatted, recipient) => {
    if (recipient === currentUserName) {
      listMyselftAtEnd = true;
    } else {
      formatted.push(recipient);
    }
    return formatted;
  }, []);
  if (listMyselftAtEnd) formattedRecipients.push(myFormattedRecipient);
  return formattedRecipients.join(', ');
};

const getFirstRecipient = recipients => {
  const [first] = recipients.split(', ');
  return first;
};

const mapStateToProps = (state, ownProps) => {
  const recipients = ownProps.thread.get('fromContactName').toArray();
  const formattedRecipients = formatRecipientsForThreadItem(
    recipients,
    myAccount.name
  );
  const firstRecipient = getFirstRecipient(formattedRecipients);
  const letters = getTwoCapitalLetters(firstRecipient);
  const color = randomcolor({
    seed: firstRecipient,
    luminosity: 'bright'
  });
  const thread = ownProps.thread.merge({
    date: defineTimeByToday(ownProps.thread.get('date')),
    subject: defineSubject(
      ownProps.thread.get('subject'),
      ownProps.thread.get('emailIds').size
    )
  });
  const mailboxlId = LabelType[ownProps.mailbox].id;
  const labelsToExclude = defineLabelsToExcludeByMailbox(mailboxlId);
  const labels = defineLabels(
    thread.get('labels'),
    state.get('labels'),
    labelsToExclude
  );
  return {
    thread: thread.toJS(),
    color,
    multiselect: state.get('activities').get('multiselect'),
    starred: thread.get('allLabels').contains(LabelType.starred.id),
    important: thread.get('allLabels').contains(LabelType.important.id),
    labels,
    letters,
    recipients: formattedRecipients
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSelectThread: thread => {
      const threadIdStore = thread.id;
      const threadIdDb = thread.threadId;
      const type = SectionType.THREAD;
      const currentLabelId = LabelType[ownProps.mailbox].id;
      const params = {
        mailboxSelected: ownProps.mailbox,
        threadIdSelected: threadIdStore
      };
      switch (currentLabelId) {
        case LabelType.inbox.id: {
          ownProps.onClickSelectedItem(type, params);
          dispatch(actions.sendOpenEvent(threadIdDb));
          break;
        }
        case LabelType.draft.id: {
          openEmailInComposer({
            key: thread.key,
            type: composerEvents.EDIT_DRAFT
          });
          break;
        }
        case LabelType.allmail.id: {
          const { allLabels } = thread;
          const draftLabelId = LabelType.draft.id;
          const inboxLabelId = LabelType.inbox.id;
          if (allLabels.includes(draftLabelId)) {
            openEmailInComposer({
              key: thread.key,
              type: composerEvents.EDIT_DRAFT
            });
            break;
          }
          if (allLabels.includes(inboxLabelId)) {
            ownProps.onClickSelectedItem(type, params);
            dispatch(actions.sendOpenEvent(threadIdDb));
            break;
          }
          ownProps.onClickSelectedItem(type, params);
          break;
        }
        default: {
          ownProps.onClickSelectedItem(type, params);
          break;
        }
      }
    },
    onAddMoveLabel: labelId => {
      const threadParams = {
        threadIdStore: ownProps.thread.get('id'),
        threadIdDB: ownProps.thread.get('threadId')
      };
      dispatch(
        actions.addMoveThreadsLabel({ threadsParams: [threadParams], labelId })
      );
    },
    onAddOrRemoveLabel: labelId => {
      const thread = ownProps.thread;
      const threadParams = {
        threadIdStore: thread.get('id'),
        threadIdDB: thread.get('threadId')
      };
      if (thread.get('allLabels').contains(labelId)) {
        dispatch(actions.removeThreadLabel(threadParams, labelId));
      } else {
        dispatch(actions.addThreadLabel(threadParams, labelId));
      }
    }
  };
};

const ThreadItem = connect(mapStateToProps, mapDispatchToProps)(
  ThreadItemWrapper
);

export default ThreadItem;
