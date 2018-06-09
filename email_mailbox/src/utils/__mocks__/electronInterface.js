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

export const LabelType = {
  inbox: {
    id: 1,
    text: 'Inbox',
    color: '#0091ff'
  },
  spam: {
    id: 2,
    text: 'Spam',
    color: '#ff0000'
  },
  sent: {
    id: 3,
    text: 'Sent',
    color: '#1a9759'
  },
  important: {
    id: 4,
    text: 'Important',
    color: '#ffdf32'
  },
  starred: {
    id: 5,
    text: 'Starred',
    color: '#ffdf32'
  },
  draft: {
    id: 6,
    text: 'Draft',
    color: '#666666'
  },
  trash: {
    id: 7,
    text: 'Trash',
    color: '#b00e0e'
  },
  search: {
    id: -1,
    text: 'Search',
    color: '#000000'
  },
  allmail: {
    id: -1,
    text: 'All Mail',
    color: null
  }
};
