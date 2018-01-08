import { Label } from './types';

export const addLabels = labels => {
  return {
    type: Label.ADD_BATCH,
    labels: labels
  };
};

export const addLabel = label => {
  let labels = {
    '10': {
      id: 10,
      text: label
    }
  };
  console.log(labels);
  return {
    type: Label.ADD_BATCH,
    labels: labels
  };
};

export const loadLabels = () => {
  return dispatch => {
    return fetch('/labels.json')
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
        return Promise.reject(response.status);
      })
      .then(json => {
        let labels = {};
        json.labels.forEach(element => {
          labels[element.id] = {
            id: element.id,
            text: element.text
          };
        });
        dispatch(addLabels(labels));
      })
      .catch(err => {
        console.log(err);
      });
  };
};
