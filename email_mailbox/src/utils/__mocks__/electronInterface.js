export const openComposerWindow = () => {};

export const getThreads = async () => {
  const response = await fetch('../../../public/threads.json');
  const json = await response.json();
  return json.threads;
};

export const getAllLabels = async () => {
  const response = await fetch('/labels.json');
  const json = await response.json();
  const labels = {};
  json.labels.forEach(element => {
    labels[element.id] = {
      id: element.id,
      text: element.text
    };
  });
  return labels;
};
