import { getEmailsGroupByThreadByParams, getContactByIds } from './ipc';

export const defineThreads = async params => {
  const threads = await getEmailsGroupByThreadByParams(params);
  const contactIds = threads.reduce((result, thread) => {
    if (thread.recipientContactIds) {
      return result.concat(thread.recipientContactIds.split(',').map(Number));
    }
    return result;
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
