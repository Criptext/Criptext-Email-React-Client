import { connect } from 'react-redux';
import { MessageType } from '../components/Message';
import MessageContent, { actionHandlerKeys } from './../data/message';
import {
  LabelType,
  getEmailsByLabelIds,
  confirmPermanentDeleteThread,
  closeDialog
} from './../utils/electronInterface';
import MessageWrapper from './../components/MessageWrapper';
import { SectionType } from '../utils/const';
import { loadThreads, removeThreads } from '../actions';

const defineMessageData = (mailboxSelected, threadsCount) => {
  const targetLabelId = mailboxSelected && LabelType[mailboxSelected].id;
  const isEmpty = threadsCount < 1;
  if (targetLabelId === LabelType.trash.id && !isEmpty) {
    return {
      ...MessageContent.advice.trash,
      type: MessageType.ADVICE,
      actionHandlerKey: actionHandlerKeys.advice.trash,
      displayMessage: true
    };
  }
  return {
    type: null,
    action: null,
    description: null,
    actionHandlerKey: null,
    displayMessage: false
  };
};

const mapStateToProps = (state, ownProps) => {
  const { threadsCount, mailbox } = ownProps;
  const messageData = defineMessageData(mailbox, threadsCount);
  const {
    action,
    description,
    displayMessage,
    type,
    actionHandlerKey
  } = messageData;
  return {
    action,
    actionHandlerKey,
    description,
    displayMessage,
    type
  };
};

const defineContactType = labelId => {
  if (labelId === LabelType.sent.id || labelId === LabelType.draft.id) {
    return ['to', 'cc'];
  }
  return ['from'];
};

const defineRejectedLabels = labelId => {
  switch (labelId) {
    case LabelType.allmail.id:
      return [LabelType.spam.id, LabelType.trash.id, LabelType.draft.id];
    case LabelType.spam.id:
    case LabelType.trash.id:
      return [];
    default:
      return [LabelType.spam.id, LabelType.trash.id];
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onExecuteMessageAction: (actionHandlerKey, params) => {
      switch (actionHandlerKey) {
        case actionHandlerKeys.success.emailSent: {
          const labelId = LabelType.sent.id;
          const loadThreadsParams = {
            labelId,
            rejectedLabelIds: defineRejectedLabels(labelId),
            contactTypes: defineContactType(labelId)
          };
          dispatch(loadThreads(loadThreadsParams)).then(() => {
            const threadType = SectionType.THREAD;
            const { threadId } = params;
            const openThreadParams = {
              mailboxSelected: 'sent',
              threadIdSelected: threadId
            };
            ownProps.onClickSection(threadType, openThreadParams);
          });
          break;
        }
        case actionHandlerKeys.advice.trash: {
          const CONFIRM_RESPONSE = 'Confirm';
          confirmPermanentDeleteThread(async response => {
            closeDialog();
            if (response === CONFIRM_RESPONSE) {
              const labelId = LabelType.trash.id;
              const emails = await getEmailsByLabelIds([labelId]);
              const threadsParams = emails.map(email => ({
                emailId: email.id,
                threadIdDB: email.threadId
              }));
              dispatch(removeThreads(threadsParams));
            }
          });
          break;
        }
        default:
          break;
      }
    }
  };
};

const Message = connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageWrapper);

export default Message;
