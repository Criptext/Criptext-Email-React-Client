import { connect } from 'react-redux';
import { MessageType } from '../components/Message';
import MessageWrapper from './../components/MessageWrapper';
import MessageContent, { actionHandlerKeys } from './../data/message';
import {
  LabelType
} from './../utils/electronInterface';
import {
  downloadUpdate
} from './../utils/ipc';
import { SectionType } from '../utils/const';
import { loadThreads } from '../actions';
import { defineRejectedLabels } from '../utils/EmailUtils';
import string from '../lang';

const { popups } = string;

const defineMessageData = (
  mailboxSelected,
  threadsCount,
  isUpdateAvailable
) => {
  const targetLabelId = mailboxSelected && LabelType[mailboxSelected].id;
  const isEmpty = threadsCount < 1;
  if (targetLabelId === LabelType.trash.id && !isEmpty) {
    return {
      ...MessageContent.advice.trash,
      type: MessageType.ADVICE,
      actionHandlerKey: actionHandlerKeys.advice.trash,
      displayMessage: true
    };
  } else if (isUpdateAvailable) {
    return {
      ...MessageContent.suggestion.update,
      type: MessageType.SUGGESTION,
      actionHandlerKey: actionHandlerKeys.suggestion.update,
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
  const { threadsCount, mailbox, isUpdateAvailable } = ownProps;
  const messageData = defineMessageData(
    mailbox,
    threadsCount,
    isUpdateAvailable
  );
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
          ownProps.setPopupContent(popups.permanently_delete)
          break;
        }
        case actionHandlerKeys.suggestion.update: {
          downloadUpdate();
          ownProps.onClickClose();
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
