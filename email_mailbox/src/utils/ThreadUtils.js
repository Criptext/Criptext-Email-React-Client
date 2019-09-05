import { getContactByIds } from './ipc';
import { getThreads } from './ApiUtils';

export const defineThreads = async params => {
  const res = await getThreads({
    labelId: params.labelId,
    limit: params.limit || 22,
    account: 1,
    date: (typeof params.date == 'number') ? (new Date(params.date * 1000)) : (params.date || Date.now().toString())
  });
  console.log(res);
  const threads = await res.json();
  console.log(threads);
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
