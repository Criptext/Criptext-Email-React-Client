import { getEmailsGroupByThreadByParams, getContactByIds } from './ipc';
import { defineRejectedLabels } from './EmailUtils';
import { LabelType } from './electronInterface';

export const assembleThreads = async params => {
  const threads = await getEmailsGroupByThreadByParams(params);
  const contactIds = threads.reduce((result, thread) => {
    return result.concat(thread.recipientContactIds.split(',').map(Number));
  }, []);
  const uniqueContactsIds = Array.from(new Set(contactIds));
  const response = await getContactByIds(uniqueContactsIds);
  let contacts;
  if (response.length) {
    contacts = response.reduce(
      (result, element) => ({
        ...result,
        [element.id]: element
      }),
      {}
    );
  }
  return { threads, contacts };
};

export const defineParamsToLoadThread = (
  mailbox,
  clear,
  searchParams,
  date,
  threadIdRejected,
  unread
) => {
  const labelId = mailbox.id;
  const contactTypes = defineContactType(
    labelId,
    searchParams ? searchParams.from : null,
    searchParams ? searchParams.to : null
  );
  const rejectedLabelIds = defineRejectedLabels(labelId);
  const contactFilter = searchParams
    ? { from: searchParams.from, to: searchParams.to }
    : undefined;
  let plain, text, subject;
  if (searchParams) {
    text = searchParams.text;
    subject = searchParams.subject;
    plain = !!searchParams.text;
  }
  const params =
    mailbox.text === 'Search'
      ? {
          labelId,
          clear,
          date,
          contactTypes,
          contactFilter,
          plain,
          text,
          subject,
          rejectedLabelIds,
          threadIdRejected
        }
      : {
          labelId,
          clear,
          date,
          contactTypes,
          rejectedLabelIds,
          threadIdRejected,
          unread
        };
  return params;
};

export const defineContactType = (labelId, from, to) => {
  if (from || to) {
    if (from && to) return ['from', 'to'];
    else if (from) return ['from'];
    return ['to'];
  }

  if (labelId === LabelType.sent.id || labelId === LabelType.draft.id) {
    return ['to', 'cc'];
  }
  return ['from'];
};
