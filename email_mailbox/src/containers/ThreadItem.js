import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import {
  addLabelIdThread,
  addLabelIdThreadDraft,
  addMoveLabelIdThreads,
  removeLabelIdThread,
  removeLabelIdThreadDraft
} from './../actions/index';
import ThreadItemWrapper from '../components/ThreadItemWrapper';
import { LabelType, myAccount, mySettings } from '../utils/electronInterface';
import { openFilledComposerWindow } from './../utils/ipc';
import { defineTimeByToday, defineUnsentText } from '../utils/TimeUtils';
import {
  getTwoCapitalLetters,
  toLowerCaseWithoutSpaces
} from '../utils/StringUtils';
import {
  appDomain,
  EmailStatus,
  SectionType,
  composerEvents,
  avatarBaseUrl
} from '../utils/const';
import { parseContactRow } from '../utils/EmailUtils';
import string from './../lang';

const EMPTY_SUBJECT_DEFAULT = `(${string.mailbox.empty_subject})`;

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
  switch (currentLabelId) {
    case LabelType.inbox.id:
    case LabelType.sent.id:
      return [LabelType.sent.id, LabelType.inbox.id];
    case LabelType.spam.id:
      return [currentLabelId];
    default:
      return [];
  }
};

const defineSubject = subject => {
  return subject.length === 0 ? EMPTY_SUBJECT_DEFAULT : subject;
};

const formatRecipientsForThreadItem = (
  recipients,
  currentUserName,
  contacts
) => {
  const shouldShowOnlyFirstName = recipients.length > 1;
  const myFormattedRecipient = string.mailbox.me;
  let listMyselftAtEnd = false;

  const formattedRecipients = recipients.reduce((formatted, recipient) => {
    const cleanRecipientName = parseContactRow(recipient);
    const contactFound = contacts.find(
      contact => contact.get('email') === recipient
    );
    const contact = contactFound ? contactFound.toJS() : cleanRecipientName;
    const recipientName = contact.name || contact.email;
    if (recipientName === currentUserName) {
      listMyselftAtEnd = true;
    } else {
      const recipientFirstName = shouldShowOnlyFirstName
        ? recipientName.replace(/[<>]/g, '').split(' ')[0]
        : recipientName;
      formatted.push(recipientFirstName);
    }
    return formatted;
  }, []);
  if (listMyselftAtEnd) formattedRecipients.push(myFormattedRecipient);
  return {
    formattedRecipients: formattedRecipients.join(', ')
  };
};

const definePreviewAndStatus = thread => {
  if (thread.get('status') === EmailStatus.UNSEND) {
    const unsentText = defineUnsentText(thread.get('unsentDate'));
    return {
      preview: unsentText,
      isUnsend: true,
      isEmpty: false
    };
  }
  const emptyEmailText = string.mailbox.empty_body;
  return {
    preview: thread.get('preview') || emptyEmailText,
    isUnsend: false,
    isEmpty: !(thread.get('preview').length > 0)
  };
};

const mapStateToProps = (state, ownProps) => {
  const avatarTimestamp = state.get('activities').get('avatarTimestamp');
  const contacts = state.get('contacts');
  const recipients = ownProps.thread.get('fromContactName').toArray();
  const { formattedRecipients } = formatRecipientsForThreadItem(
    recipients,
    myAccount.name,
    contacts
  );
  const lastRecipient = parseContactRow(ownProps.thread.get('fromAddress'));
  const letters = getTwoCapitalLetters(
    lastRecipient.name || lastRecipient.email,
    'D'
  );
  const color = randomcolor({
    seed: lastRecipient.name || lastRecipient.email,
    luminosity: mySettings.theme === 'dark' ? 'dark' : 'bright'
  });
  const thread = ownProps.thread.merge({
    date: defineTimeByToday(ownProps.thread.get('date')),
    subject: defineSubject(ownProps.thread.get('subject'))
  });
  const mailboxlId = ownProps.mailbox.id;
  const isLabelCustome = mailboxlId === LabelType.starred.id || mailboxlId > 7;
  const labelsToExclude = isLabelCustome
    ? []
    : defineLabelsToExcludeByMailbox(mailboxlId);
  const labels = defineLabels(
    thread.get('allLabels'),
    state.get('labels'),
    labelsToExclude
  );
  const [username, domain = appDomain] = lastRecipient.email.split(`@`);
  const avatarUrl = `${avatarBaseUrl}${domain}/${username}?date=${avatarTimestamp}`;
  const { preview, isUnsend, isEmpty } = definePreviewAndStatus(thread);
  const hasNoSubject = thread.get('subject') === EMPTY_SUBJECT_DEFAULT;
  const isSecure = thread.get('secure');
  return {
    avatarUrl,
    color,
    hasNoSubject,
    isStarred: thread.get('allLabels').contains(LabelType.starred.id),
    isDraft: thread.get('allLabels').contains(LabelType.draft.id),
    isEmpty,
    isSecure,
    isUnsend,
    labels,
    letters,
    preview,
    recipients: formattedRecipients,
    thread: thread.toJS()
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const currentLabelId = ownProps.mailbox.id;
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
          if (ownProps.mailbox.text === 'Search') {
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
        addMoveLabelIdThreads({
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
          dispatch(removeLabelIdThreadDraft(currentLabelId, uniqueId, labelId));
        } else {
          dispatch(addLabelIdThreadDraft(currentLabelId, uniqueId, labelId));
        }
      } else {
        if (isAdded) {
          dispatch(removeLabelIdThread(currentLabelId, threadId, labelId));
        } else {
          dispatch(addLabelIdThread(currentLabelId, threadId, labelId));
        }
      }
    }
  };
};

const ThreadItem = connect(mapStateToProps, mapDispatchToProps)(
  ThreadItemWrapper
);

export default ThreadItem;
