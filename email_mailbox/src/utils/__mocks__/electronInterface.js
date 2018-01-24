export const openComposerWindow = () => {};

export const getThreads = async () => {
  const response = await fetch('../../../public/threads.json');
  const json = await response.json();
  return json.threads;
};
