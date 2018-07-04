import { connect } from 'react-redux';
import * as actions from './../actions/index';
import ThreadItemWrapper from '../components/ThreadItemWrapper';
import {
  composerEvents,
  LabelType,
  openEmailInComposer
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

const getRecipients = ownProps => {
  const thread = ownProps.thread;
  const ownMailbox = ownProps.mailbox;
  if (ownMailbox === 'allmail' || ownMailbox === 'search') {
    const isSent = thread.get('allLabels').includes(LabelType.sent.id);
    const isDraft = thread.get('allLabels').includes(LabelType.draft.id);
    const from = thread.get('fromContactName').first();
    const to = thread.get('fromContactName').last();
    return isSent || isDraft ? to : from;
  }
  return thread.get('fromContactName').first();
};

const mapStateToProps = (state, ownProps) => {
  const recipients = getRecipients(ownProps);
  const letters = getTwoCapitalLetters(recipients);
  const color = randomcolor({
    seed: recipients,
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
    starred: thread.get('labels').contains(LabelType.starred.id),
    important: thread.get('labels').contains(LabelType.important.id),
    labels,
    letters,
    recipients
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
      if (thread.get('labels').contains(labelId)) {
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
