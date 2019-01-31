import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import * as actions from './../actions/index';
import ThreadItemWrapper from '../components/ThreadItemWrapper';
import { LabelType, myAccount, mySettings } from '../utils/electronInterface';
import { openFilledComposerWindow } from './../utils/ipc';
import { defineTimeByToday } from '../utils/TimeUtils';
import { appDomain } from '../utils/const'
import {
  getTwoCapitalLetters,
  toLowerCaseWithoutSpaces
} from '../utils/StringUtils';
import { SectionType, composerEvents } from '../utils/const';
import string from './../lang';
import { parseContactRow } from '../utils/EmailUtils';

const defineLabels = (labelIds, labels, labelsToExclude) => {
  if (!labels.size) return [];
  const result = labelIds.toArray().reduce((result, labelId) => {
    if (!labelsToExclude.includes(labelId)) {
      const label = labels.get(`${labelId}`);
      if (label) {
        const text = label.get('text');
        result.push({
          id: label.get('id'),
          color: label.get('color'),
          text:
            label.get('type') === 'system'
              ? string.labelsItems[toLowerCaseWithoutSpaces(text)]
              : text
        });
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

const formatRecipientsForThreadItem = (recipients, currentUserName, contacts) => {
  const shouldShowOnlyFirstName = recipients.length > 1;
  const myFormattedRecipient = string.mailbox.me;
  let listMyselftAtEnd = false;
  let firstRecipientEmail;
  const formattedRecipients = recipients.reduce((formatted, recipient, index) => {
    const cleanRecipientName = parseContactRow(recipient);
    const contactFound = contacts.find( contact => contact.get('email') === cleanRecipientName.email)
    const contact = contactFound ? contactFound.toJS() : cleanRecipientName
    const recipientName = contact.name || contact.email;
    if (recipientName === currentUserName) {
      listMyselftAtEnd = true;
    } else {
      const recipientFirstName = shouldShowOnlyFirstName
        ? recipientName.replace(/[<>]/g, '').split(' ')[0]
        : recipientName;
      formatted.push(recipientFirstName);
      if (!firstRecipientEmail) {
        firstRecipientEmail = contact.email.replace(`@${appDomain}`, '');
      }
    }
    return formatted;
  }, []);
  if (listMyselftAtEnd) formattedRecipients.push(myFormattedRecipient);
  if (!firstRecipientEmail) {
    firstRecipientEmail = myAccount.recipientId;
  }
  return {firstRecipientEmail, formattedRecipients: formattedRecipients.join(', ')};
};

const getFirstRecipient = recipients => {
  const [first] = recipients.split(', ');
  return first;
};

const mapStateToProps = (state, ownProps) => {
  const contacts = state.get('contacts');
  const recipients = ownProps.thread.get('fromContactName').toArray();
  const { firstRecipientEmail, formattedRecipients } = formatRecipientsForThreadItem(
    recipients,
    myAccount.name,
    contacts
  );
  const firstRecipient = getFirstRecipient(formattedRecipients);
  const letters = getTwoCapitalLetters(firstRecipient, 'D');
  const color = randomcolor({
    seed: firstRecipient,
    luminosity: mySettings.theme === 'dark' ? 'dark' : 'bright'
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
    firstRecipientEmail,
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
            openFilledComposerWindow({
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
            openFilledComposerWindow({
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
