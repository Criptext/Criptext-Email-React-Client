import { getEmailsGroupByThreadByParams, getContactByIds } from './ipc';
import { LabelType } from './electronInterface';
import { defineRejectedLabels } from './EmailUtils';

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

  let plain, text, subject, contactFilter, searchInLabelId;
  if (searchParams) {
    text = searchParams.text;
    subject = searchParams.subject;
    plain = !!searchParams.text;
    if (searchParams.from) contactFilter = { from: searchParams.from };
    if (searchParams.to) contactFilter = { to: searchParams.to };
    if (searchParams.labelId) searchInLabelId = searchParams.labelId;
  }
  const rejectedLabelIds = defineRejectedLabels(labelId, searchInLabelId);

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
          threadIdRejected,
          searchInLabelId
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

export const defineThreads = async (params, otherContactIds = []) => {
  const threads = await getEmailsGroupByThreadByParams(params);
  const contactIds = threads.reduce((result, thread) => {
    if (thread.recipientContactIds) {
      return result.concat(thread.recipientContactIds.split(',').map(Number));
    }
    return result;
  }, []);
  const uniqueContactsIds = Array.from(
    new Set([...contactIds, ...otherContactIds])
  );
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
