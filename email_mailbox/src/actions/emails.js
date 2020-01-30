import { Email } from './types';
import {
  createEmailLabel,
  deleteEmailByKeys,
  deleteEmailContent,
  deleteEmailLabel,
  getContactByIds,
  getEmailsByIds,
  getEmailsByThreadId,
  getLabelsByText,
  postPeerEvent,
  unsendEmailEvent,
  updateEmail
} from '../utils/ipc';
import {
  addDataApp,
  addContacts,
  addFiles,
  unsendEmailFiles,
  updateEmailIdsThread,
  updateBadgeLabels,
  updateThreadsSuccess
} from './index';
import { EmailStatus, SocketCommand } from '../utils/const';
import {
  sendUnsendEmailErrorMessage,
  sendUnsendEmailExpiredErrorMessage,
  sendUpdateThreadLabelsErrorMessage,
  sendRemoveThreadsErrorMessage
} from './../utils/electronEventInterface';
import {
  filterCriptextRecipients,
  formEmailLabel
} from './../utils/EmailUtils';
import { defineContacts } from './../utils/ContactUtils';
import { defineFiles } from './../utils/FileUtils';

const eventlessEmailStatuses = [EmailStatus.FAIL, EmailStatus.SENDING];

export const addEmails = emails => {
  return {
    type: Email.ADD_BATCH,
    emails
  };
};

export const addEmailLabels = (emails, labelsAdd) => ({
  type: Email.ADD_LABEL,
  emails,
  labelsAdd
});

export const removeEmailLabels = (emails, labelsDelete) => ({
  type: Email.DELETE_LABEL,
  emails,
  labelsDelete
});

export const muteNotifications = emailId => {
  return {
    type: Email.MUTE,
    emailId
  };
};

export const markEmailUnreadSuccess = (emailId, unread) => {
  return {
    type: Email.MARK_UNREAD,
    emailId,
    unread
  };
};

export const loadEmails = ({ threadId, emailIds }) => {
  return async dispatch => {
    try {
      const data = await _loadEmails({ threadId, emailIds });
      const contactIds = Array.from(data.contactIds);
      const fileTokens = Array.from(data.fileTokens);

      const contacts = await defineContacts(contactIds);
      const contact = addContacts(contacts);
      const files = await defineFiles(fileTokens);
      const file = addFiles(files);
      const email = addEmails(data.emails);
      dispatch(addDataApp({ contact, email, file }));
    } catch (e) {
      // TO DO
    }
  };
};

export const muteEmail = (emailId, valueToSet) => {
  return async dispatch => {
    try {
      await updateEmail({ id: emailId, isMuted: valueToSet });
      dispatch(muteNotifications(emailId));
    } catch (e) {
      // To do
    }
  };
};

export const removeEmails = (labelId, emailsParams) => {
  return async dispatch => {
    try {
      const allMetadataKeys = emailsParams.map(param => param.key);
      const allEmailIds = emailsParams.map(param => param.id);
      const metadataKeys = emailsParams.reduce((result, item) => {
        if (!eventlessEmailStatuses.includes(item.status)) {
          result.push(item.key);
        }
        return result;
      }, []);

      const dbResponse = await deleteEmailByKeys(allMetadataKeys);

      if (dbResponse) {
        if (metadataKeys.length) {
          const eventParams = {
            cmd: SocketCommand.PEER_EMAIL_DELETED_PERMANENTLY,
            params: { metadataKeys }
          };
          const { status } = await postPeerEvent(eventParams);

          if (status === 200) {
            if (allMetadataKeys.length === 1) {
              const [email] = emailsParams;
              dispatch(
                updateEmailIdsThread({
                  labelId,
                  threadId: email.threadId,
                  emailIdToAdd: null,
                  emailIdsToRemove: [email.id]
                })
              );
            }

            dispatch(removeEmailsOnSuccess(allEmailIds));
          }
        }
      }
    } catch (e) {
      sendRemoveThreadsErrorMessage();
    }
  };
};

export const removeEmailsOnSuccess = emailIds => ({
  type: Email.REMOVE_EMAILS,
  emailIds
});

export const unsendEmail = params => {
  return async dispatch => {
    const { key, emailId, contactIds, unsentDate } = params;
    try {
      const contacts = await getContactByIds(contactIds);
      const emails = contacts.map(contact => contact.email);
      const criptextRecipients = filterCriptextRecipients(emails);
      const params = {
        metadataKey: Number(key),
        recipients: criptextRecipients
      };
      const { status } = await unsendEmailEvent(params);
      if (status === 200) {
        await updateEmail({
          key,
          status: EmailStatus.UNSEND,
          content: '',
          preview: '',
          unsentDate
        });
        await deleteEmailContent({ metadataKey: key });
        dispatch(unsendEmailFiles(emailId)).then(() =>
          dispatch(
            unsendEmailOnSuccess(
              String(emailId),
              unsentDate,
              EmailStatus.UNSEND
            )
          )
        );
      } else if (status === 405) {
        sendUnsendEmailExpiredErrorMessage();
      } else {
        sendUnsendEmailErrorMessage(status);
      }
    } catch (e) {
      sendUnsendEmailErrorMessage();
    }
  };
};

export const unsendEmailOnSuccess = (emailId, unsentDate, status) => ({
  type: Email.UNSEND,
  emailId,
  unsentDate,
  status
});

export const updateUnreadEmail = (
  labelId,
  threadId,
  emailId,
  key,
  valueToSet
) => {
  return async dispatch => {
    try {
      const metadataKeys = [key];
      const eventParams = {
        cmd: SocketCommand.PEER_EMAIL_READ_UPDATE,
        params: { metadataKeys, unread: valueToSet ? 1 : 0 }
      };
      const { status } = await postPeerEvent(eventParams);
      if (status === 200) {
        await updateEmail({ id: emailId, unread: !!valueToSet });
        dispatch(markEmailUnreadSuccess(emailId, valueToSet));
        dispatch(updateThreadsSuccess(labelId, [threadId], valueToSet));
        dispatch(updateBadgeLabels([labelId]));
      }
    } catch (e) {
      // To do
    }
  };
};

export const updateEmailOnSuccess = email => ({
  type: Email.UPDATE,
  email
});

export const updateEmailsSuccess = emails => ({
  type: Email.UPDATE_EMAILS,
  emails
});

export const updateEmailLabels = ({
  labelId,
  email,
  labelsAdded,
  labelsRemoved
}) => {
  return async dispatch => {
    try {
      if (email) {
        if (labelsAdded.length) {
          const addedLabels = await getLabelsByText(labelsAdded);
          const addedLabelsIds = addedLabels.map(label => label.id);
          const emailLabelsToAdd = formEmailLabel({
            emailId: email.id,
            labels: addedLabelsIds
          });

          await createEmailLabel(emailLabelsToAdd);
        }
        if (labelsRemoved.length) {
          const removedLabels = await getLabelsByText(labelsRemoved);
          const removedLabelsIds = removedLabels.map(label => label.id);
          const emailLabelsToRemove = {
            emailIds: [email.id],
            labelIds: removedLabelsIds
          };

          await deleteEmailLabel(emailLabelsToRemove);
        }

        let shouldDispatch;
        if (!eventlessEmailStatuses.includes(email.status)) {
          const eventParams = {
            cmd: SocketCommand.PEER_EMAIL_LABELS_UPDATE,
            params: {
              metadataKeys: [Number(email.key)],
              labelsAdded,
              labelsRemoved
            }
          };

          const { status } = await postPeerEvent(eventParams);

          shouldDispatch = status === 200;
        } else {
          shouldDispatch = true;
        }

        if (shouldDispatch) {
          dispatch(
            updateEmailIdsThread({
              labelId,
              threadId: email.threadId,
              emailIdToAdd: null,
              emailIdsToRemove: [email.id]
            })
          );
          if (labelsAdded.length) {
            const addedLabels = await getLabelsByText(labelsAdded);
            const addedLabelsIds = addedLabels.map(label => label.id);
            dispatch(addEmailLabels([email], addedLabelsIds));
          }
        } else {
          sendUpdateThreadLabelsErrorMessage();
        }
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const _loadEmails = async ({ threadId, emailIds }) => {
  const response = threadId
    ? await getEmailsByThreadId(threadId)
    : await getEmailsByIds(emailIds);
  return response.reduce(
    (result, element) => {
      element.fromContactIds = element.fromContactIds
        ? element.fromContactIds.split(',').map(Number)
        : [];
      element.to = element.to ? element.to.split(',').map(Number) : [];
      element.cc = element.cc ? element.cc.split(',').map(Number) : [];
      element.bcc = element.bcc ? element.bcc.split(',').map(Number) : [];
      const contactIds = [
        ...element.fromContactIds,
        ...element.to,
        ...element.cc,
        ...element.bcc
      ];
      const fileTokens = element.fileTokens
        ? element.fileTokens.split(',')
        : [];
      return {
        emails: { ...result.emails, [element.id]: element },
        fileTokens: new Set([...result.fileTokens, ...fileTokens]),
        contactIds: new Set([...result.contactIds, ...contactIds])
      };
    },
    { emails: {}, fileTokens: new Set(), contactIds: new Set() }
  );
};
