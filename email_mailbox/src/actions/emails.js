import { Email } from './types';
import { unsendEmailEvent, postPeerEvent } from '../utils/electronInterface';
import {
  createEmailLabel,
  deleteEmailByKeys,
  deleteEmailLabel,
  getContactByIds,
  getEmailsByThreadId,
  getLabelsByText,
  updateEmail
} from '../utils/ipc';
import { loadContacts } from './contacts';
import { EmailStatus, SocketCommand } from '../utils/const';
import { unsendEmailFiles } from './files';
import {
  sendUnsendEmailErrorMessage,
  sendUnsendEmailExpiredErrorMessage,
  sendUpdateThreadLabelsErrorMessage,
  sendRemoveThreadsErrorMessage
} from './../utils/electronEventInterface';
import { filterCriptextRecipients } from './../utils/EmailUtils';
import { updateEmailIdsThread } from './threads';
import { formEmailLabel } from '../utils/EmailUtils';

const eventlessEmailStatuses = [EmailStatus.FAIL, EmailStatus.SENDING];

export const addEmails = emails => {
  return {
    type: Email.ADD_BATCH,
    emails: emails
  };
};

export const muteNotifications = emailId => {
  return {
    type: Email.MUTE,
    emailId
  };
};

export const markEmailUnreadSuccess = (emailId, unreadValue) => {
  return {
    type: Email.MARK_UNREAD,
    emailId,
    unread: unreadValue
  };
};

export const loadEmails = threadId => {
  return async dispatch => {
    try {
      const response = await getEmailsByThreadId(threadId);
      const data = response.reduce(
        (result, element) => {
          element.from = element.from
            ? element.from.split(',').map(Number)
            : [];
          element.to = element.to ? element.to.split(',').map(Number) : [];
          element.cc = element.cc ? element.cc.split(',').map(Number) : [];
          element.bcc = element.bcc ? element.bcc.split(',').map(Number) : [];
          const contactIds = [
            ...element.from,
            ...element.to,
            ...element.cc,
            ...element.bcc
          ];
          return {
            emails: { ...result.emails, [element.id]: element },
            contactIds: new Set([...result.contactIds, ...contactIds])
          };
        },
        { emails: {}, contactIds: new Set() }
      );
      data.contactIds = Array.from(data.contactIds);
      dispatch(loadContacts(data.contactIds));
      dispatch(addEmails(data.emails));
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

export const markEmailUnread = (emailId, valueToSet) => {
  return async dispatch => {
    try {
      await updateEmail({ id: emailId, unread: !!valueToSet });
      dispatch(markEmailUnreadSuccess(emailId, valueToSet));
    } catch (e) {
      // To do
    }
  };
};

export const removeEmails = emailsParams => {
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
    const { key, emailId, contactIds, unsendDate } = params;
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
          unsendDate
        });
        dispatch(unsendEmailFiles(emailId)).then(() =>
          dispatch(
            unsendEmailOnSuccess(
              String(emailId),
              unsendDate,
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

export const unsendEmailOnSuccess = (emailId, unsendDate, status) => ({
  type: Email.UNSEND,
  emailId,
  unsendDate,
  status
});

export const updateEmailLabels = ({ email, labelsAdded, labelsRemoved }) => {
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
          const removedLabels = await getLabelsByText(labelsAdded);
          const removedLabelsIds = removedLabels.map(label => label.id);
          const emailLabelsToRemove = formEmailLabel({
            emailId: email.id,
            labels: removedLabelsIds
          });

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
              threadId: email.threadId,
              emailIdToAdd: null,
              emailIdsToRemove: [email.id]
            })
          );
        } else {
          sendUpdateThreadLabelsErrorMessage();
        }
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};
