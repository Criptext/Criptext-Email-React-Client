import { getEmailsGroupByThreadByParams, getContactByIds } from './ipc';

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
