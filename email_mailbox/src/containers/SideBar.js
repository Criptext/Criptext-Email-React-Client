import { connect } from 'react-redux';
import { loadLabels, loadThreads } from '../actions';
import SideBarView from '../components/SideBar';

const mapStateToProps = state => {
  return {
    labels: state.get('labels'),
    optionSelected: state.get('activities').get('mailbox')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadLabels: () => {
      dispatch(loadLabels(dispatch));
    },
    onLoadThreads: params => {
      dispatch(loadThreads(params));
    }
  };
};

const SideBar = connect(mapStateToProps, mapDispatchToProps)(SideBarView);

export default SideBar;
