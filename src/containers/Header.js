import { connect } from 'react-redux';
import * as actions from '../actions/index';
import HeaderWrapper from '../components/HeaderWrapper';

const mapStateToProps = state => {
  const multiselect = state.get('activities').get('multiselect')
  const threadsSelected = getThreadsSelected(state.get('threads'), multiselect);
  return {
    multiselect: multiselect,
    threadsSelected: threadsSelected,
    allSelected: threadsSelected.length === state.get('threads').size
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDeselectThreads: () => {
      return dispatch(actions.deselectThreads())
    },
    onSelectThreads: () => {
      return dispatch(actions.selectThreads())
    },
    onMoveThreads: (threadsIds, label) => {
      return dispatch(actions.moveThreads(threadsIds, label))
    }
  }
};

const Header = connect(mapStateToProps, mapDispatchToProps)(
  HeaderWrapper
);

function getThreadsSelected(threads, multiselect){
  if(!multiselect){
    return [];
  }

  return threads.reduce( function(ids, thread){
    if(thread.get('selected')){
      ids.push(thread.get('id'))
    }
    return ids;
  }, [])
}

export default Header;
