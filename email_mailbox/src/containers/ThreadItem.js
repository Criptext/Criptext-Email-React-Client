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

const getMailHeader = ownProps => {
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
  const header = getMailHeader(ownProps);
  const letters = getTwoCapitalLetters(header);
  const color = randomcolor({
    seed: header,
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
    header
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSelectThread: thread => {
      const threadId = thread.id;
      const type = SectionType.THREAD;
      const params = {
        mailboxSelected: ownProps.mailbox,
        threadIdSelected: threadId
      };
      if (LabelType[ownProps.mailbox].id === LabelType.draft.id) {
        openEmailInComposer({
          key: thread.key,
          type: composerEvents.EDIT_DRAFT
        });
      } else if (LabelType[ownProps.mailbox].id === LabelType.allmail.id) {
        const allLabels = thread.allLabels;
        if (allLabels.includes(LabelType.draft.id)) {
          openEmailInComposer({
            key: thread.key,
            type: composerEvents.EDIT_DRAFT
          });
        } else {
          ownProps.onClickSelectedItem(type, params);
        }
      } else {
        ownProps.onClickSelectedItem(type, params);
      }
    },
    onMultiSelect: (threadId, value) => {
      dispatch(actions.multiSelectThread(threadId, value));
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
