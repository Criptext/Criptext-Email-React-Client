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

const defineLabels = (labelIds, labels) => {
  if (!labels.size) return [];
  const result = labelIds.toArray().map(labelId => {
    return labels.get(labelId.toString()).toObject();
  });
  return result ? result : [];
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
  const subject = ownProps.thread.get('subject');
  const thread = ownProps.thread.merge({
    date: defineTimeByToday(ownProps.thread.get('date')),
    subject: subject.length === 0 ? '(No Subject)' : subject
  });
  const labels = defineLabels(thread.get('labels'), state.get('labels'));
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
    onRemove: () => {
      const threadParams = {
        threadIdStore: ownProps.thread.get('id'),
        threadIdDB: ownProps.thread.get('threadId')
      };
      dispatch(actions.addThreadLabel(threadParams, LabelType.trash.id));
    },
    onStarClick: () => {
      const thread = ownProps.thread;
      const threadParams = {
        threadIdStore: thread.get('id'),
        threadIdDB: thread.get('threadId')
      };
      if (thread.get('labels').contains(LabelType.starred.id)) {
        dispatch(actions.removeThreadLabel(threadParams, LabelType.starred.id));
      } else {
        dispatch(actions.addThreadLabel(threadParams, LabelType.starred.id));
      }
    },
    onImportantClick: () => {
      const thread = ownProps.thread;
      const threadParams = {
        threadIdStore: thread.get('id'),
        threadIdDB: thread.get('threadId')
      };
      if (thread.get('labels').contains(LabelType.important.id)) {
        dispatch(
          actions.removeThreadLabel(threadParams, LabelType.important.id)
        );
      } else {
        dispatch(actions.addThreadLabel(threadParams, LabelType.important.id));
      }
    }
  };
};

const ThreadItem = connect(mapStateToProps, mapDispatchToProps)(
  ThreadItemWrapper
);

export default ThreadItem;
