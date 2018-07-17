import { connect } from 'react-redux';
import { MessageType } from '../components/Message';
import MessageContent, { actionHandlerKeys } from './../data/message';
import { LabelType } from './../utils/electronInterface';
import MessageWrapper from './../components/MessageWrapper';
import { SectionType } from '../utils/const';
import { loadThreads } from '../actions';

const defineMessageData = mailboxSelected => {
  const targetLabelId = LabelType[mailboxSelected].id;
  if (targetLabelId === LabelType.trash.id) {
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
  const { mailbox } = ownProps;
  const messageData = defineMessageData(mailbox);
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
            const { emailId } = params;
            const openThreadParams = {
              mailboxSelected: 'sent',
              threadIdSelected: emailId
            };
            ownProps.onClickSection(threadType, openThreadParams);
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
