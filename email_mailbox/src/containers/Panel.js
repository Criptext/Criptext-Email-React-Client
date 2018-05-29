import { connect } from 'react-redux';
import { loadThreads } from '../actions';
import PanelWrapper from '../components/PanelWrapper';

const mapStateToProps = state => {
  const threadsCount = state.get('threads').size;
  return {
    threadsCount
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadThreads: params => {
      dispatch(loadThreads(params));
    }
  };
};

const Panel = connect(mapStateToProps, mapDispatchToProps)(PanelWrapper);

export default Panel;
