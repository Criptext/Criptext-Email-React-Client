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
      const label = labels.get(labelId.toString());
      if (label) {
        result.push(label.toObject());
      }
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
  const letters = getTwoCapitalLetters(firstRecipient, 'D');
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
    isStarred: thread.get('allLabels').contains(LabelType.starred.id),
    isDraft: thread.get('allLabels').contains(LabelType.draft.id),
    labels,
    letters,
    recipients: formattedRecipients
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const currentLabelId = LabelType[ownProps.mailbox].id;
  return {
    onSelectThread: thread => {
      const threadIdDb = thread.threadId;
      const type = SectionType.THREAD;
      const params = {
        mailboxSelected: ownProps.mailbox,
        threadIdSelected: threadIdDb
      };
      switch (currentLabelId) {
        case LabelType.inbox.id: {
          ownProps.onClickSelectedItem(type, params);
          break;
        }
        case LabelType.draft.id: {
          if (threadIdDb) {
            ownProps.onClickSelectedItem(type, params);
          } else {
            openEmailInComposer({
              key: thread.key,
              type: composerEvents.EDIT_DRAFT
            });
          }
          break;
        }
        case LabelType.allmail.id: {
          const { allLabels } = thread;
          const draftLabelId = LabelType.draft.id;
          if (ownProps.mailbox === 'search') {
            ownProps.onClickSelectedItem(type, {
              ...params,
              searchParams: ownProps.searchParams
            });
          } else if (allLabels.includes(draftLabelId)) {
            openEmailInComposer({
              key: thread.key,
              type: composerEvents.EDIT_DRAFT
            });
          } else {
            ownProps.onClickSelectedItem(type, params);
          }
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
        threadIdDB: ownProps.thread.get('threadId')
      };
      dispatch(
        actions.addMoveLabelIdThreads({
          threadsParams: [threadParams],
          labelIdToAdd: labelId,
          currentLabelId
        })
      );
    },
    onAddOrRemoveLabel: (labelId, isAdded) => {
      const thread = ownProps.thread;
      const threadId = thread.get('threadId');
      if (currentLabelId === LabelType.draft.id && !threadId) {
        const uniqueId = thread.get('uniqueId');
        if (isAdded) {
          dispatch(actions.removeLabelIdThreadDraft(uniqueId, labelId));
        } else {
          dispatch(actions.addLabelIdThreadDraft(uniqueId, labelId));
        }
      } else {
        if (isAdded) {
          dispatch(actions.removeLabelIdThread(threadId, labelId));
        } else {
          dispatch(actions.addLabelIdThread(threadId, labelId));
        }
      }
    }
  };
};

const ThreadItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadItemWrapper);

export default ThreadItem;
