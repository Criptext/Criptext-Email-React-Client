import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadHeaderView from '../components/ThreadHeader';

const formThreadParams = thread => {
  return {
    threadIdStore: thread.get('id'),
    threadIdDB: thread.get('threadId')
  };
};

const mapStateToProps = (state, ownProps) => {
  const labels = getLabelIncluded(
    state.get('labels'),
    ownProps.thread ? ownProps.thread.get('labels') : null
  );
  return {
    threadsSelected: [
      ownProps.thread ? formThreadParams(ownProps.thread) : null
    ],
    labels,
    allLabels: state.get('labels'),
    history: ownProps.history
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onBackOption: () => {
      ownProps.onClickThreadBack();
    },
    onMoveThreads: (threadsIds, label) => {
      dispatch(actions.closeThread());
      return dispatch(actions.moveThreads(threadsIds, label));
    },
    onAddLabel: (threadsIds, label) => {
      return dispatch(actions.addThreadsLabel(threadsIds, label));
    },
    onRemoveLabel: (threadsIds, label) => {
      return dispatch(actions.removeThreadsLabel(threadsIds, label));
    },
    onMarkRead: (threadsIds, read) => {
      return dispatch(actions.markThreadsRead(threadsIds, read));
    }
  };
};

function getLabelIncluded(labels, threadLabels) {
  if (!threadLabels) return [];
  const hasLabels = threadLabels.reduce((lbs, label) => {
    if (!lbs[label]) {
      lbs[label] = 1;
    } else {
      lbs[label]++;
    }
    return lbs;
  }, {});

  return labels.reduce((lbs, label) => {
    const labelId = label.get('id');
    const labelText = label.get('text');
    let checked = 'none';
    if (hasLabels[labelId]) {
      checked = 'all';
    }
    lbs.push({
      id: labelId,
      text: labelText,
      checked
    });
    return lbs;
  }, []);
}

const ThreadHeader = connect(mapStateToProps, mapDispatchToProps)(
  ThreadHeaderView
);

export default ThreadHeader;
