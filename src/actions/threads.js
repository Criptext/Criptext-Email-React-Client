import * as Types from './types';

export const addThreads = threads => {
  return {
    type: Types.Thread.ADD_BATCH,
    threads: threads.sort((t1, t2) => {
      return t1.lastEmailDate <= t2.lastEmailDate;
    })
  };
};

export const selectThread = threadId => {
  return {
    type: Types.Thread.SELECT,
    selectedThread: threadId
  };
};

export const multiSelectThread = (threadId, value) => {
  return {
    type: Types.Thread.MULTISELECT,
    selectedThread: threadId,
    value: value
  };
};

export const filterThreadsByUnread = enabled => {
  return {
    type: Types.Thread.UNREAD_FILTER,
    enabled: enabled
  };
};

export const addThreadLabel = (threadId, label) => {
  return {
    type: Types.Thread.ADD_THREAD_LABEL,
    targetThread: threadId,
    label: label
  };
};

export const addThreadsLabel = (threadId, label) => {
  return {
    type: Types.Thread.ADD_THREADS_LABEL,
    threadsIds: threadId,
    label: label
  };
};

export const removeLabel = (threadId, label) => {
  return {
    type: Types.Thread.REMOVE_LABEL,
    targetThread: threadId,
    label: label
  };
};

export const removeThreadsLabel = (threadId, label) => {
  return {
    type: Types.Thread.REMOVE_THREADS_LABEL,
    threadsIds: threadId,
    label: label
  };
};

export const removeThread = (threadId) => {
  return {
    type: Types.Thread.REMOVE,
    targetThread: threadId
  }
}

export const removeThreads = (threadsIds) => {
  return {
    type: Types.Thread.REMOVE_THREADS,
    targetThreads: threadsIds
  }
}

export const deselectThreads = (spread) => {
  return {
    type: Types.Thread.DESELECT_THREADS,
    spread
  }
}

export const selectThreads = () => {
  return {
    type: Types.Thread.SELECT_THREADS
  }
}

export const moveThreads = (threadsIds, label) => {
  return {
    label,
    threadsIds,
    type: Types.Thread.MOVE_THREADS,
  }
} 

export  const markThreadsRead = (threadsIds, read) => {
  return {
    threadsIds,
    read,
    type: Types.Thread.THREAD_READ
  }
}

export const loadThreads = () => {
  return async dispatch => {
    try {
      const response = await fetch('/threads.json');
      const json = await response.json();
      dispatch(addThreads(json.threads));
    }catch(e){
      console.log(e);
    }
  };
};
